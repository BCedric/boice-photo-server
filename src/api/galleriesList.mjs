import express from 'express'
import sqlite3 from 'sqlite3'
import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'

var db = new sqlite3.Database('boicephoto.sqlite');
let GalleriesListRouter = express.Router();

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
  .get(async function (req, res) {
    try {
      const gallery = await DB.get(queries.getGallery, { $id: req.params.gallerieslist })

      const description = gallery.description
      const galleriesChildren = await DB.all(queries.getGalleriesList, { $parentId: req.params.gallerieslist })

      var galleries = []
      galleriesChildren.forEach(
        async galleryChild => {
          const randPicture = await DB.get(queries.getRandomPictureFromGallerie, { $id: galleryChild.id })
          if (randPicture != null) {
            galleryChild.randPicture = '/picture/' + randPicture.id
          }
          galleries.push(galleryChild)
          galleries.length === galleriesChildren.length && res.json({ galleries, description, name: galleriesChildren[0].parent_name, id: galleriesChildren[0].parentId })
        }
      )
    } catch (err) {
      res.json(err)
    }
  })

// return galleries which have galleries children and no picture
GalleriesListRouter.route('/gallerieslists')
  .get(async function (req, res) {
    try {
      const galleriesLists = await DB.all(queries.allGalleriesLists)
      res.json(galleriesLists)
    } catch (err) {
      res.json(err)
    }
  })

// return brothers of a gallery
GalleriesListRouter.route('/gallerieslists/gallery/:galleryId')
  .get(async function (req, res) {
    try {
      res.json(await DB.all(queries.getGalleriesListOfGallery, { $id: req.params.galleryId }))
    } catch (error) {
      console.log(error);

      res.json(error)
    }
  })

export default GalleriesListRouter

import express from 'express'
import lodash from 'lodash'
import sqlite3 from 'sqlite3'
import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'

var db = new sqlite3.Database('boicephoto.sqlite');
let GalleriesListRouter = express.Router();
const { forEach, map } = lodash

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
  .get(async function (req, res) {
    try {
      const gallery = await DB.get(queries.getGallery, { $id: req.params.gallerieslist })

      const description = gallery.description
      const galleriesChildren = await DB.all(queries.getGalleriesList(req.params.gallerieslist))

      var galleries = []
      galleriesChildren.forEach(
        async galleryChild => {
          const randPicture = await DB.get(queries.getRandomPictureFromGallerie(galleryChild.id))
          if (randPicture != null) {
            galleryChild.randPicture = '/picture/' + randPicture.id
          }
          galleries.push(galleryChild)
          galleries.length === galleriesChildren.length && res.json({ galleries, description, name: galleriesChildren[0].parent_name, id: galleriesChildren[0].parent_id })
        }
      )
    } catch (err) {
      res.json(err)
    }
  })

GalleriesListRouter.route('/gallerieslists')
  .get(async function (req, res) {
    try {
      const galleriesLists = await DB.all(queries.allGalleriesLists)
      res.json(galleriesLists)
    } catch (err) {
      res.json(err)
    }
  })

GalleriesListRouter.route('/gallerieslists/gallery/:galleryId')
  .get(function (req, res) {
    db.all(queries.getGalleriesListOfGallery(req.params.galleryId), function (err, rows) {
      res.json(rows)
    })
  })

export default GalleriesListRouter

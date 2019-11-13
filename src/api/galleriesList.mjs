import express from 'express'

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import GalleriesList from '../domain/galleriesLists/GalleriesList.mjs';

let GalleriesListRouter = express.Router();

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
  .get(async function (req, res) {
    try {
      res.json(await new GalleriesList(req.params.gallerieslist).init())
    } catch (err) {
      res.json(err)
    }
  })

// return galleries which have galleries children and no picture
GalleriesListRouter.route('/gallerieslists')
  .get(async function (req, res) {
    try {
      res.json(await GalleriesList.all())
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
      res.json(error)
    }
  })

export default GalleriesListRouter

import express from 'express'
import fs from 'file-system'
import path from 'path'

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import config from '../utils/config.mjs'
import GalleriesList from '../domain/galleriesLists/GalleriesList.mjs';
import { uploadFiles } from '../shared/upload-files.mjs';
import { addGallery } from '../domain/galleries/galleries-functions.mjs';

let GalleriesListRouter = express.Router();

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
  .get(async function (req, res) {
    try {
      res.json(await new GalleriesList(req.params.gallerieslist).init())
    } catch (err) {
      res.json(err)
    }
  })

GalleriesListRouter.route('/gallerieslist')
  .post(async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      const galleriesName = JSON.parse(fields.galleries)
      fs.mkdir(path.normalize(`${config.imageFolder}/${galleriesName}`), async () => {
        await DB.run(queries.postGallery, { $name: fields.name })
        const galleriesList = await DB.get(queries.getGalleryByName, { $name: fields.name })
        galleriesName.forEach(async galleryName => {
          const galleryFiles = Object.entries(files)
            .filter(([key, value]) => key.includes(galleryName))
            .map(([key, value]) => value)
          addGallery({ name: galleryName, parentId: galleriesList.id }, galleryFiles)
        })
        res.json(await GalleriesList.all())
      })
    } catch (err) {
      res.json({ err })
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

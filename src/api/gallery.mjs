import express from 'express'

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import { addGallery } from '../domain/galleries/galleries-functions.mjs';
import Gallery from '../domain/galleries/Gallery.mjs';
import { uploadFiles } from '../shared/upload-files.mjs';

let GalleryRouter = express.Router();

GalleryRouter.route('/gallery/:galleryId')
  .get(async function (req, res) {
    try {
      const gallery = new Gallery(req.params.galleryId)
      res.json(await gallery.init())
    } catch (err) {
      res.json({ err })
    }
  })

  .delete(async function (req, res) {
    try {
      await new Gallery(req.params.galleryId).delete()
      res.json({ galleries: await Gallery.all() })
    } catch (err) {
      res.json({ err })
    }
  })

  .put(async function (req, res) {
    const { galleryId } = req.params
    try {
      const gallery = new Gallery(galleryId)
      const { name, description } = req.body
      if (name != null && name !== '') {
        await gallery.setName(name)
      }
      if (description != null && description !== '') {
        await gallery.setDescription(description)
      }
      res.json({ message: "update OK" })
    } catch (err) {
      res.json({ err })
    }
  })

GalleryRouter.route('/gallery')
  // body : {name, parentId, file1, file2 ...}
  .post(async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      await addGallery(fields, Object.values(files))
      const galleries = await Gallery.all()
      res.json({ galleries })
    } catch (err) {
      res.json(err)
    }
  })

GalleryRouter.route('/galleries')
  .get(async (req, res) => {
    try {
      res.json({
        galleries: await Gallery.all()
      })
    } catch (err) {
      res.json({ err })
    }
  })

GalleryRouter.route('/galleriesnotinlists')
  .get(async (req, res) => {
    try {
      res.json({
        galleries: await DB.all(queries.getGalleriesNotInLists)
      })
    } catch (err) {
      res.json({ err })
    }
  })

GalleryRouter.route('/navgalleries')
  .get(async (req, res) => {
    try {
      const galleriesLists = await DB.all(queries.allGalleriesLists)
      const galleries = await DB.all(queries.getGalleriesNotInLists)
      res.json({
        galleriesLists,
        galleries
      })
    } catch (err) {
      res.json({ err })
    }
  })





export default GalleryRouter

import express from 'express'

import queries from '../utils/queries.mjs'
import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'
import { addPicture } from '../domain/pictures/pictures-functions.mjs';
import { uploadFiles } from '../shared/upload-files.mjs';
import Picture from '../domain/pictures/Picture.mjs';
import Gallery from '../domain/galleries/Gallery.mjs';

var PictureRouter = express.Router();

var options = {
  root: config.imageFolder,
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};

PictureRouter.route('/picture/:pictureId')
  .get(async function (req, res) {
    try {
      const picture = await new Picture(req.params.pictureId).init()
      res.sendFile(picture.address, options)
    } catch (err) {
      res.json({ err })
    }
  })

  .put(async function (req, res) {
    try {
      await DB.run(queries.putPicture, { $name: req.query.name, $id: req.params.pictureId })
      res.json({ message: "update OK" })
    } catch (err) {
      res.json(err)
    }
  })

  .delete(async function (req, res) {
    try {
      const { pictureId } = req.params
      const picture = new Picture(pictureId)
      await picture.delete()
      const gallery = await new Gallery(picture.galleryId).init()
      res.json({ pictures: gallery.pictures })
    } catch (err) {
      res.json({ err: err })
    }
  })

PictureRouter.route('/picture')
  .post(async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      const gallery = await new Gallery(fields.galleryId).init()
      await addPicture(files.file, gallery)
      const galleryUpdated = await new Gallery(fields.galleryId).init()
      res.json({ pictures: galleryUpdated.pictures })
    } catch (err) {
      res.json(err)
    }
  })



PictureRouter.route('/pictures')
  .get(async function (req, res) {
    try {
      const pictures = await Picture.all()
      res.json({ pictures })
    } catch (err) {
      res.json({ err })
    }
  })


export default PictureRouter

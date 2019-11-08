import express from 'express'

import queries from '../utils/queries.mjs'
import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'
import { removePicture } from '../domain/pictures/pictures-functions.mjs';
import { addPicture } from '../domain/pictures/pictures-functions.mjs';
import { uploadFiles } from '../shared/upload-files.mjs';

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
      const picture = await DB.get(queries.getPicture, { $id: req.params.pictureId })
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
      const picture = await DB.get(queries.getPicture, { $id: pictureId })
      removePicture(picture)
      res.json({ message: "Delete OK" })
    } catch (err) {
      res.json({ err: err })
    }
  })

PictureRouter.route('/picture')
  .post(async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      const gallery = await DB.get(queries.getGallery, { $id: fields.galleryId })
      await addPicture(files.file, gallery)
      res.json({ msg: 'picture added' })

    } catch (err) {
      res.json(err)
    }
  })



PictureRouter.route('/pictures')
  .get(async function (req, res) {
    try {
      const pictures = await DB.all(queries.allPictures)
      res.json({ pictures: pictures.map(picture => ({ addr: '/picture/' + picture.id, height: picture.height, width: picture.width })) })
    } catch (err) {
      res.json({ err })
    }
  })


export default PictureRouter

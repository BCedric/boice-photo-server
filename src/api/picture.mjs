import express from 'express'
import path from 'path'
import fs from 'file-system'
import sizeOf from 'image-size';

import queries from '../utils/queries.mjs'
import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'
import { galleryPathConstructor } from '../utils/gallery-path-constructor.mjs'

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
      res.sendFile(picture.adresse, options)
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
      await DB.run(queries.deletePicture, { $id: pictureId })
      fs.unlinkSync(path.normalize(`${config.imageFolder}/${picture.adresse}`))
      // db.close()

      res.json({ message: "Delete OK" })
    } catch (err) {
      res.json({ err: err })
    }
  })

PictureRouter.route('/picture')
  .post(async function (req, res) {
    try {
      const { galleryId } = req.fields
      const { name: pictureName, path: filePath } = req.files.file
      const { width, height } = sizeOf(filePath)

      const gallery = await DB.get(queries.getGallery, { $id: galleryId })
      const relativeGalleryPath = gallery != null
        ? await galleryPathConstructor(gallery)
        : ''
      await DB.run(queries.postPicture({
        name: pictureName,
        adresse: path.normalize(
          galleryId == null
            ? pictureName
            : `${relativeGalleryPath}/${pictureName}`
        ),
        width,
        height,
        gallery_id: galleryId

      }))
      fs.copyFileSync(filePath, `${config.imageFolder}/${relativeGalleryPath}/${pictureName}`)
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

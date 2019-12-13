import express from 'express'

import queries from '../utils/queries.mjs'
import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'
import { uploadFiles } from '../shared/upload-files.mjs';
import { addPicture } from '../domain/pictures/pictures-functions.mjs';
import Picture from '../domain/pictures/Picture.mjs';
import Gallery from '../domain/galleries/Gallery.mjs';
import { authMiddleware } from '../domain/auth/auth-functions.mjs';

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
      res.json({ err: err.toString() })
    }
  })

  .put(authMiddleware, async function (req, res) {
    try {
      const picture = await new Picture(req.params.pictureId).init()
      if (picture.galleryId != null) {
        const gallery = await new Gallery(picture.galleryId).init()
        const oldPictureGalleryPreview = gallery.pictures.filter(picture => picture.galleryPreview)[0]
        if (oldPictureGalleryPreview != null) {
          await oldPictureGalleryPreview.setGalleryPreview(false)
        }
        await picture.setGalleryPreview(req.body.galleryPreview)
        await gallery.init()
        res.json({ gallery })
      } else {
        throw 'La photo n\'est pas dans une galerie'
      }

    } catch (err) {
      res.json(err)
    }
  })



  .delete(authMiddleware, async function (req, res) {
    try {
      const { pictureId } = req.params
      const picture = new Picture(pictureId)
      await picture.delete()
      const gallery = await new Gallery(picture.galleryId).init()
      res.json({ gallery })
    } catch (err) {
      res.json({ err: err })
    }
  })

PictureRouter.route('/picture')
  .post(authMiddleware, async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      const galleryId = parseInt(fields.galleryId)
      const gallery = galleryId != null
        ? await new Gallery(galleryId).init()
        : null
      await addPicture(Object.values(files), gallery)
      if (gallery != null) {
        const galleryUpdated = await new Gallery(galleryId).init()
        res.json({ gallery: galleryUpdated })
      } else {
        res.json({ message: 'photos ajoutées' })
      }
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
      res.json({ err: err.toString() })
    }
  })


export default PictureRouter

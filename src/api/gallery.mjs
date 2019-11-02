import express from 'express'

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import { removeGallery } from '../domain/galleries/galleries-functions.mjs';
import { addGallery } from '../domain/galleries/galleries-functions.mjs';

let GalleryRouter = express.Router();

GalleryRouter.route('/gallery/:galleryId')
  .get(async function (req, res) {
    try {
      const gallery = await DB.get(queries.getGallery, { $id: req.params.galleryId })

      if (gallery !== undefined) {
        const pictures = await DB.all(queries.getPicturesByGallery, { $galleryId: gallery.id })
        res.json({ pictures: pictures.map(picture => ({ addr: '/picture/' + picture.id, height: picture.height, width: picture.width })), description: gallery.description, name: gallery.name, id: gallery.id })
      }
      else res.json({ message: "la galerie n'existe pas" })
    } catch (err) {
      res.json({ err })
    }
  })

  .delete(async function (req, res) {
    try {
      await removeGallery(req.params.galleryId)
      res.json({ message: "Delete OK" })
    } catch (err) {
      res.json({ err })
    }
  })

// .put(function(req,res){
//   db.run( queries.put, {$name: req.query.name, $id: req.params.pictureId})
//   res.json({message: "update OK"})
// })



// console.log('multer', multer);



GalleryRouter.route('/gallery')
  // body : {name, parentId, file1, file2 ...}
  .post(async function (req, res) {
    try {
      await addGallery(req.fields, req.files)
      res.json({ message: "Insert OK" })
    } catch (err) {
      res.json(err)
    }
  })



GalleryRouter.route('/galleries')
  .all(async (req, res) => {
    try {
      res.json({
        galleries: await DB.all(queries.allGalleries)
      })
    } catch (err) {
      res.json({ err })
    }
  })

GalleryRouter.route('/galleriesnotinlists')
  .all(async (req, res) => {
    try {
      res.json({
        galleries: await DB.all(queries.getGalleriesNotInLists)
      })
    } catch (err) {
      res.json({ err })
    }
  })




export default GalleryRouter

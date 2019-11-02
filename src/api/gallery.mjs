import express from 'express'
import sqlite3 from 'sqlite3'
import fs from 'file-system'
import lodash from 'lodash'

import config from '../utils/config'
import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'

let GalleryRouter = express.Router();
let db = new sqlite3.Database('boicephoto.sqlite');
const { forEach, map, merge } = lodash

GalleryRouter.route('/gallery/:galleryId')
  .get(async function (req, res) {
    try {
      const gallery = await DB.get(queries.getGallery, { $id: req.params.galleryId })

      if (gallery !== undefined) {
        const pictures = await DB.all(queries.getPicturesByGallery, { $gallery_id: gallery.id })
        res.json({ pictures: map(pictures, picture => ({ addr: '/picture/' + picture.id, height: picture.height, width: picture.width })), description: gallery.description, name: gallery.name, id: gallery.id })
      }
      else res.json({ message: "la galerie n'existe pas" })
    } catch (err) {
      res.json({ err })
    }
    // db.close()
  })

// .put(function(req,res){
//   db.run( queries.put, {$name: req.query.name, $id: req.params.pictureId})
//   db.close()
//   res.json({message: "update OK"})
// })

// .post(function(req,res){
//   db.run( queries.post, { $name: req.query.name })
//   db.close()
//   res.json({message: "Insert OK"})
// })

// .delete(async function (req, res) {
//   try {
//     const gallery = await DB.get(queries.getGallery, { $id: req.params.galleryId })
//       .then(gallery => {
//         if (gallery == null) {
//           throw "la galerie n'existe pas"
//         }
//         return gallery
//       })
//     const galleryPictures = await DB.all(queries.getPicturesByGallery, { $gallery_id: gallery.id })
//     forEach(galleryPictures, picture => {
//       DB.run(queries.deletePicture, { $id: picture.id })
//       fs.unlinkSync(`img/${picture.adresse}`)
//     })
//     console.log(`${config.imageFolder}${gallery.name}`);

//     fs.rmdirSync(`${config.imageFolder}${gallery.name}`)
//     // await DB.run(queries.deleteGallery, { $id: req.params.galleryId })
//     res.json({ message: "Delete OK" })
//   } catch (err) {
//     res.json({ err })
//   }
//   // db.close()
// })

GalleryRouter.route('/galleries')
  .all((req, res) => {
    db.all(queries.allGalleries, (err, rows) => {
      res.json({ galleries: rows })
    })
  })

GalleryRouter.route('/galleriesnotinlists')
  .all((req, res) => {
    db.all(queries.getGalleriesNotInLists, (err, rows) => {
      res.json(rows)
    })
  })




export default GalleryRouter

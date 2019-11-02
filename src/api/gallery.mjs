import express from 'express'
import sqlite3 from 'sqlite3'
import fs from 'file-system'
import path from 'path'
import lodash from 'lodash'
import sizeOf from 'image-size';

import config from '../utils/config'
import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'

let GalleryRouter = express.Router();
let db = new sqlite3.Database('boicephoto.sqlite');
const { map } = lodash

const galleryPathConstructor = gallery => new Promise(async (resolve, reject) => {
  try {
    if (gallery.parent_id == null) {
      resolve(gallery.name)
    } else {
      const parentGallery = await DB.get(queries.getGallery, { $id: gallery.parent_id })
      console.log('parentGallery', parentGallery, gallery);
      resolve(`${await galleryPathConstructor(parentGallery)}/${gallery.name}`)
    }
  } catch (error) {
    reject(error)
  }
})

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

  .delete(async function (req, res) {
    try {
      const gallery = await DB.get(queries.getGallery, { $id: req.params.galleryId })
        .then(gallery => {
          if (gallery == null) {
            throw "la galerie n'existe pas"
          }
          return gallery
        })

      const galleryPictures = await DB.all(queries.getPicturesByGallery, { $gallery_id: gallery.id })

      galleryPictures.forEach(picture => {
        DB.run(queries.deletePicture, { $id: picture.id })
        fs.unlinkSync(path.normalize(`${config.imageFolder}/${picture.adresse}`))
      })

      fs.rmdirSync(path.normalize(`${config.imageFolder}/${await galleryPathConstructor(gallery)}`))
      await DB.run(queries.deleteGallery, { $id: req.params.galleryId })
      res.json({ message: "Delete OK" })
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



// console.log('multer', multer);



GalleryRouter.route('/gallery')
  .post(async function (req, res) {
    try {
      const { name: galleryName, parentId } = req.fields
      const galleryParent = parentId != null && await DB.get(queries.getGallery, { $id: parentId })
      const galleryPath = path.normalize(`${config.imageFolder}/${
        parentId == null
          ? galleryName
          : `${await galleryPathConstructor(galleryParent)}/${galleryName}`
        }`)

      await DB.run(queries.postGallery, { $name: galleryName, $parent_id: parentId })
      const gallery = await DB.get(queries.getGalleryByName, { $name: galleryName })
      fs.mkdir(galleryPath, () => {
        Object.values(req.files).forEach(file => {
          const { name: pictureName } = file
          fs.copyFileSync(file.path, `${galleryPath}/${pictureName}`)
          var { width, height } = sizeOf(file.path);
          const pictureAddress = path.normalize(`${path.relative(config.imageFolder, galleryPath)}/${pictureName}`)
          DB.run(queries.postPicture({ name: pictureName, adresse: pictureAddress, width, height, gallery_id: gallery.id }))

        })
      })
    } catch (err) {
      res.json(err)
    }
    // db.run( queries.post, { $name: req.query.name })
    // db.close()
    res.json({ message: "Insert OK" })
  })



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

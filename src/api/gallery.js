import express from 'express'
import sqlite3 from 'sqlite3'
import fs from 'file-system'
import { forEach, map, merge } from 'lodash'

import config from '../utils/config'
import queries from '../utils/queries'
import treatError from '../utils/treatError'

let GalleryRouter = express.Router();
let db = new sqlite3.Database('boicephoto.sqlite');

GalleryRouter.route('/gallery/:galleryId')
.get(function(req,res){
  db.get(queries.getGallery,  {$id: req.params.galleryId}, function(err, row) {
    if(row !== undefined) db.all(queries.getPicturesByGallery, {$gallery_id: row.id}, (err, rows) => {
      res.json({pictures: map(rows, row => ({addr:'/picture/'+row.id, height: row.height, width: row.width})), description: row.description, name: row.name, id: row.id})
    })
    else res.json({message: "no galerie"})
  })
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

.delete(function(req,res){
    db.get(queries.getGallery,  {$id: req.params.galleryId}, function(err, galleryRow) {
      if(galleryRow.id !== undefined) db.all(queries.getPicturesByGallery, {$gallery_id: galleryRow.id}, (err, pictureRows) => {
        forEach(pictureRows, pictureRow => {
          db.run(queries.deletePicture, {$id: pictureRow.id})
          fs.unlinkSync('dist/'+pictureRow.adresse)
        })
        fs.rmdirSync(config.imageFolder+galleryRow.name)
      })
    })

  db.run(queries.deleteGallery, {$id: req.params.galleryId})
  // db.close()
  res.json({message: "Delete OK"})
})

GalleryRouter.route('/galleries')
.all((req,res) => {
  db.all(queries.allGalleries, (err, rows) => {
    res.json({galleries: rows})
  })
})

GalleryRouter.route('/galleriesnotinlists')
.all((req, res ) => {
  db.all(queries.getGalleriesNotInLists, (err, rows) => {
    res.json(rows)
  })
})




export default GalleryRouter

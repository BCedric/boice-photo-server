import express from 'express'
import fs from 'file-system'
import { forEach, map } from 'lodash'
import sqlite3 from 'sqlite3'
import sizeOf from 'image-size';
import queries from '../utils/queries'
import treatError from '../utils/treatError'

var db = new sqlite3.Database('boicephoto.sqlite');
let GalleriesListRouter = express.Router();

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
.get(function(req,res) {

  db.all(queries.getGalleriesList(req.params.gallerieslist), function(err, rows) {
    let galleries = []
      console.log('rows', rows);
      forEach(rows, row => {
        db.each(queries.getRandomPictureFromGallerie(row.id), (err, rowImg) => {
          row.randPicture = '/picture/'+rowImg.id
          galleries.push(row)
        })
      })
      setTimeout(() => res.json({galleries, name: rows[0].parent_name}), 450);
  })
})

GalleriesListRouter.route('/gallerieslists')
.get(function(req,res) {
  db.all(queries.allGalleriesLists, function(err, rows) {
    res.json(rows)
  })
})

GalleriesListRouter.route('/gallerieslists/gallery/:galleryId')
.get(function(req, res) {
  db.all(queries.getGalleriesListOfGallery(req.params.galleryId), function(err, rows) {
    res.json(rows)
  })
})

export default GalleriesListRouter

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
  var description
  db.get(queries.getGallery, {$id: req.params.gallerieslist}, function(err, row) {
    description = row.description
  })
  db.all(queries.getGalleriesList(req.params.gallerieslist), function(err, rows) {

    var galleries = []
    forEach(rows, (row, index) => {
      db.each(queries.getRandomPictureFromGallerie(row.id), (err, rowImg) => {
        row.randPicture = '/picture/'+rowImg.id
        galleries.push(row)
        galleries.length === rows.length && res.json({galleries, description, name: rows[0].parent_name, id: rows[0].parent_id})
      })
    })
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

import express from 'express'
import fs from 'file-system'
import assign from 'lodash'
import sqlite3 from 'sqlite3'
import sizeOf from 'image-size';
import queries from '../utils/queries'
import treatError from '../utils/treatError'

var db = new sqlite3.Database('boicephoto.sqlite');
let GalleriesListRouter = express.Router();

GalleriesListRouter.route('/gallerieslist/:gallerieslist')
.get(function(req,res) {
  db.all(queries.getGalleriesList(req.params.gallerieslist), function(err, rows) {
    res.json({galleries: rows})
  })
})

GalleriesListRouter.route('/gallerieslists')
.get(function(req,res) {
  db.all(queries.allGalleriesLists, function(err, rows) {
    res.json({galleriesList: rows})
  })
})

export default GalleriesListRouter

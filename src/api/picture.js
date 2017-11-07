import express from 'express'
import sqlite3 from 'sqlite3'
import imagemin from 'imagemin'
import multiparty from 'multiparty'
import imageminJpegoptim from 'imagemin-jpegoptim'
import imageminPngquant from 'imagemin-pngquant'

import queries from '../utils/queries'
import imagesUpload from '../utils/images-upload'
import { map } from 'lodash'


var PictureRouter = express.Router();

var db = new sqlite3.Database('boicephoto.sqlite');

var options = {
    root: __dirname + '../../../',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

PictureRouter.route('/picture/:pictureId')
.get(function(req,res){
  db.get(queries.getPicture,  {$id: req.params.pictureId}, function(err, row) {
    console.log(row);
    res.sendFile(row.adresse, options)
  })
})

.put(function(req,res){
  db.run( queries.putPicture, {$name: req.query.name, $id: req.params.pictureId})
  // db.close()
  res.json({message: "update OK"})
})

.post(function (req, res) {
  imagesUpload(
    './img',
    'http://localhost:8080/static/multipleFiles',
    true,
    false,
    (filename, adresse, width, height) => {
      db.run( queries.postPicture, {$name: filename, $adresse: adresse, $width: width, $height: height})
      // db.close()
    }
  )(req,res)

  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    const {originalFilename} = files.imageFiles[0];
    let fileName = originalFilename;
    console.log(fileName, files.imageFiles);
  })
})

.delete(function(req,res){
  db.get(queries.getPicture,  {$id: req.params.pictureId}, function(err, row) {
    console.log(row);
  })
  // db.run(queries.delete, {$id: req.params.pictureId})
  // db.close()
  res.json({message: "Delete OK"})
})

PictureRouter.route('/pictures')
.get(function(req, res){
  db.all(queries.allPictures, function(err, rows) {
    res.json({pictures: map(rows, row => ({addr:'/picture/'+row.id, height: row.height, width: row.width}))})
  })
})


export default PictureRouter

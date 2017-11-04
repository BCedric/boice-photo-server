import express from 'express'
import sqlite3 from 'sqlite3'
import imagemin from 'imagemin'
import multiparty from 'multiparty'
import imageminJpegoptim from 'imagemin-jpegoptim'
import imageminPngquant from 'imagemin-pngquant'
import imagesUpload from '../utils/images-upload'
import { map } from 'lodash'


var PictureRouter = express.Router();

var db = new sqlite3.Database('boicephoto.sqlite');

var queries = {
  get:  "SELECT * FROM Pictures WHERE id = $id",
  put : "UPDATE Pictures SET name = $name WHERE id = $id",
  delete : "DELETE FROM Pictures WHERE id = $id",
  post : "INSERT INTO Pictures (name, adresse, width, height) VALUES ($name, $adresse, $width, $height)",
  all : "SELECT * FROM Pictures"
}

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
  db.get(queries.get,  {$id: req.params.pictureId}, function(err, row) {
    console.log(row);
    // res.sendFile('EcrinZbra.jpg', options)
    res.sendFile(row.adresse, options)
  })
})

.put(function(req,res){
  db.run( queries.put, {$name: req.query.name, $id: req.params.pictureId})
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
      db.run( queries.post, {$name: filename, $adresse: adresse, $width: width, $height: height})
      // db.close()
    }
  )(req,res)

  const form = new multiparty.Form();
  form.parse(req, (err, fields, files) => {
    const {originalFilename} = files.imageFiles[0];
    let fileName = originalFilename;
    console.log(fileName, files.imageFiles);
  })

  // imagemin(['imgBrut/*.{jpg,png}'], 'img', {
  // 	plugins: [
  // 		imageminJpegoptim([true, 30]),
  // 		imageminPngquant({quality: '65-80'})
	//    ]
  // }).then(files => {
  // 	console.log(files);
  // 	//=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
  // })

  // return res.json({message: "photo added"})
})

.delete(function(req,res){
  db.run(queries.delete, {$id: req.params.pictureId})
  // db.close()
  res.json({message: "Delete OK"})
})

PictureRouter.route('/pictures')
.get(function(req, res){
  db.all(queries.all, function(err, rows) {
    res.json({pictures: map(rows, row => ({addr:'/picture/'+row.id, height: row.height, width: row.width}))})
  })
})


export default PictureRouter

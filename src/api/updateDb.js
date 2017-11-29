import express from 'express'
import fs from 'file-system'
import {assign} from 'lodash'
import sqlite3 from 'sqlite3'
import sizeOf from 'image-size';
import queries from '../utils/queries'
import treatError from '../utils/treatError'
import config from '../utils/config.js'

var db = new sqlite3.Database('boicephoto.sqlite');
let UpdateDbRouter = express.Router();

const readFilesSaveDB = (folder, res) => {
  var galleries = []
  fs.recurse(folder, (filepath, relative, filename) => {
    if(filename === undefined) {
      galleries.push(relative.substr(relative.lastIndexOf('/')+1))
      db.run( queries.postGallery, {$name: relative.substr(relative.lastIndexOf('/')+1)})
    }
  })
  fs.recurse(folder, (filepath, relative, filename) => {

    db.all(queries.allGalleries, (e, rows) => {
      if(filename !== undefined && filename !== 'description.txt') {
        var dimensions = sizeOf(filepath);
        var options = {
          name: filename,
          adresse: relative,
          width: dimensions.width,
          height: dimensions.height
        }
        if(relative.includes("/")) {
          var galleryName = relative.slice(0, relative.lastIndexOf('/'))
          while(galleryName.lastIndexOf('/') !== -1) galleryName = galleryName.slice(galleryName.lastIndexOf('/')+1, galleryName.length)
          db.get(queries.getGalleryByName, {$name: galleryName}, (e, row) => {
            treatError(e);
            options.gallery_id = row.id
            db.run(queries.postPicture(options), (e) => treatError(e))
          })
        } else {
          db.run(queries.postPicture(options), (e) => treatError(e))
        }
      } else if(filename === 'description.txt') {
        fs.readFile(filepath, 'utf8', (err, data) => {
          var galleryName = relative.slice(0, relative.lastIndexOf('/'))
          while(galleryName.lastIndexOf('/') !== -1) galleryName = galleryName.slice(galleryName.lastIndexOf('/')+1, galleryName.length)
          db.run(queries.updateGalleriesDescription, {$description: data, $name: galleryName})

        })
      }
      else if (relative.includes("/")){
        const $parentName = relative.slice(0, relative.lastIndexOf('/'))
        const $galleryName = relative.slice(relative.lastIndexOf('/') + 1, relative.length)
        db.run(queries.updateGalleryParentId, {$parentName, $galleryName }, (e) => treatError(e))
      }
    })
    console.log(filepath, relative, filename);
  })
  res.json({update : 'OK'});
}

UpdateDbRouter.route('/updatedb')
.get(function(req,res){
  db.run(queries.deleteTable("Pictures"), (e) => {
    // res.json({error: e})
    db.run(queries.deleteTable("Galleries"), (e) => {
      // res.json({error: e})
      db.run(queries.createTableGalleries, (e) => {
        // res.json({error: e})
        db.run(queries.createTablePictures, (e) => {
          readFilesSaveDB(config.imageFolder, res)
        })
      })
    })
  })
})




export default UpdateDbRouter

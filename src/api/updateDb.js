import express from 'express'
import fs from 'file-system'
import assign from 'lodash'
import sqlite3 from 'sqlite3'
import sizeOf from 'image-size';
import queries from '../utils/queries'
import treatError from '../utils/treatError'

var db = new sqlite3.Database('boicephoto.sqlite');
let UpdateDbRouter = express.Router();

const readFilesSaveDB = folder => {
  var galleries = []
  fs.recurse(folder, (filepath, relative, filename) => {
    if(filename === undefined) {
      galleries.push(relative)
      db.run( queries.postGallery, {$name: relative})

    }
  })

  fs.recurse(folder, (filepath, relative, filename) => {
    var galleries
    db.all(queries.allGalleries, (e, rows) => {
      rows
      if(filename !== undefined) {
        var dimensions = sizeOf(filepath);
        var options = {
          name: filename,
          adresse: filepath,
          width: dimensions.width,
          height: dimensions.height
        }
        if(relative.includes("/")) {
          const gallerieName = relative.substring(0, relative.indexOf('/'))
          db.get(queries.getGalleryByName, {$name: gallerieName}, (e, row) => {
            treatError(e);
            options.gallery_id = row.id
            db.run(queries.postPicture(options), (e) => treatError(e))
          })
        } else {
          db.run(queries.postPicture(options), (e) => treatError(e))
        }
      }
    })
    console.log(filepath, relative, filename);
  })
}

UpdateDbRouter.route('/updatedb')
.get(function(req,res){
  db.run(queries.deleteTable("Pictures"), (e) => {
    treatError(e)
    db.run(queries.deleteTable("Galleries"), (e) => {
      treatError(e);
      db.run(queries.createTableGalleries, (e) => {
        treatError(e);
        db.run(queries.createTablePictures, (e) => {
          readFilesSaveDB('img')
        })
      })
    })
  })
  res.json({update : 'OK'});
})




export default UpdateDbRouter

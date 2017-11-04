import express from 'express'
import sqlite3 from 'sqlite3'
import { merge } from 'lodash'

let PictureRouter = express.Router();

let db = new sqlite3.Database('boicephoto.sqlite');

let queries = {
  get:  "SELECT * FROM Galleries WHERE id = $id",
  put : "UPDATE Pictures SET name = $name WHERE id = $id",
  delete : "DELETE FROM Pictures WHERE id = $id",
  post : "INSERT INTO Pictures (name) VALUES ($name)",
  all : "SELECT * FROM Pictures"
}

PictureRouter.route('/picture/:pictureId')
.get(function(req,res){
  db.get(queries.get,  {$id: req.params.pictureId}, function(err, row) {
    res.json({picture : row});
  })
})

.put(function(req,res){
  db.run( queries.put, {$name: req.query.name, $id: req.params.pictureId})
  db.close()
  res.json({message: "update OK"})
})

.post(function(req,res){
  db.run( queries.post, { $name: req.query.name })
  db.close()
  res.json({message: "Insert OK"})
})

.delete(function(req,res){
  db.run(queries.delete, {$id: req.params.pictureId})
  db.close()
  res.json({message: "Delete OK"})
})

PictureRouter.route('/pictures')
.get(function(req, res){
  db.all(queries.all, function(err, rows) {
    res.json({pictures: rows})
  })
})


export default PictureRouter

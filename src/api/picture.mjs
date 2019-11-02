import express from 'express'
import multiparty from 'multiparty'
import queries from '../utils/queries.mjs'
import imagesUpload from '../utils/images-upload.mjs'
import lodash from 'lodash'
import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'

const { map } = lodash
var PictureRouter = express.Router();

var options = {
  root: config.imageFolder,
  dotfiles: 'deny',
  headers: {
    'x-timestamp': Date.now(),
    'x-sent': true
  }
};

PictureRouter.route('/picture/:pictureId')
  .get(async function (req, res) {
    try {
      const picture = await DB.get(queries.getPicture, { $id: req.params.pictureId })
      res.sendFile(picture.adresse, options)
    } catch (err) {
      res.json({ err })
    }
  })

  .put(async function (req, res) {
    try {
      await DB.run(queries.putPicture, { $name: req.query.name, $id: req.params.pictureId })
      res.json({ message: "update OK" })
    } catch (err) {
      res.json(err)
    }
  })

  .post(async function (req, res) {
    imagesUpload(
      './img',
      'http://localhost:8080/static/multipleFiles',
      true,
      false,
      async (filename, adresse, width, height) => {
        try {
          await DB.run(queries.postPicture, { $name: filename, $adresse: adresse, $width: width, $height: height })
        } catch (err) {
          throw err
        }
      }
    )(req, res)

    try {
      const form = new multiparty.Form();
      form.parse(req, (err, fields, files) => {
        const { originalFilename } = files.imageFiles[0];
        let fileName = originalFilename;
        console.log(fileName, files.imageFiles);
      })

    } catch (err) {
      res.json(err)
    }
  })

  .delete(async function (req, res) {
    try {
      await DB.run(queries.deletePicture, { $id: req.params.pictureId })
      // db.close()
      res.json({ message: "Delete OK" })
    } catch (err) {
      res.json({ err: err })
    }
  })

PictureRouter.route('/pictures')
  .get(async function (req, res) {
    try {
      const pictures = await DB.all(queries.allPictures)
      res.json({ pictures: map(pictures, picture => ({ addr: '/picture/' + picture.id, height: picture.height, width: picture.width })) })
    } catch (err) {
      res.json({ err })
    }
  })


export default PictureRouter

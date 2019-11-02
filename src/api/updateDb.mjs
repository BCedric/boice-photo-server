import express from 'express'
import fs from 'file-system'
import path from 'path'
import sizeOf from 'image-size';

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import config from '../utils/config.mjs'

let UpdateDbRouter = express.Router();

const addGallery = async (galleryName, parentGalleryName) =>
  new Promise(async (resolve, reject) => {
    try {
      await DB.run(queries.postGallery, { $name: galleryName })
      if (parentGalleryName != null) {
        await DB.run(queries.updateGalleryParentId, { $parentName: parentGalleryName, $galleryName: galleryName })
      }

      resolve(null)
    } catch (err) {
      reject(err)
    }
  })

const addPicture = (pictureName, picturePath, parentGalleryName) => new Promise(async (resolve, reject) => {
  const adresse = path.relative(config.imageFolder, picturePath)
  var dimensions = sizeOf(picturePath);
  var options = {
    name: pictureName,
    adresse,
    width: dimensions.width,
    height: dimensions.height,
  }

  if (parentGalleryName != null) {
    const gallery = await DB.get(queries.getGalleryByName, { $name: parentGalleryName })
    options.gallery_id = gallery.id
  }

  await DB.run(queries.postPicture(options))
  resolve(null)
})

const getFileStat = async path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stat) => {
      if (err != null) {
        reject(err)
      }
      resolve(stat)
    })
  })

const readDir = async folder =>
  new Promise((resolve, reject) => {
    fs.readdir(folder, async (err, items) => {
      if (err != null) {
        reject(err)
      }
      resolve(items)
    })
  })

const readFilesSaveDB = async (folder) => {
  try {
    const items = await readDir(folder)
    items.forEach(async (filename) => {
      const fileStat = await getFileStat(`${folder}/${filename}`)
      const parentDirectoryPath = path.resolve(`${folder}/${filename}`, '..')
      const parentGalleryName = parentDirectoryPath === path.normalize(config.imageFolder) ? null : path.basename(parentDirectoryPath)
      if (fileStat.isDirectory()) {
        await addGallery(filename, parentGalleryName)
        readFilesSaveDB(`${folder}/${filename}`, parentGalleryName)
      } else {
        await addPicture(filename, `${folder}/${filename}`, parentGalleryName)
      }
    })
  } catch (err) {
    throw err
  }
}

UpdateDbRouter.route('/updatedb')
  .get(async function (req, res) {
    try {
      await DB.run(queries.deleteTable("Pictures"))
      await DB.run(queries.deleteTable("Galleries"))
      await DB.run(queries.createTableGalleries)
      await DB.run(queries.createTablePictures)
      readFilesSaveDB(config.imageFolder)
      res.json({ update: 'OK' });
    } catch (err) {
      res.json({ err })
    }
  })

export default UpdateDbRouter
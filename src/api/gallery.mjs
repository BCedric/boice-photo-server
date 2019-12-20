import express from 'express'

import queries from '../utils/queries.mjs'
import DB from '../shared/db.mjs'
import { uploadFiles } from '../shared/upload-files.mjs';
import { addGallery } from '../domain/galleries/galleries-functions.mjs';
import Gallery from '../domain/galleries/Gallery.mjs';
import { authMiddleware } from '../domain/auth/auth-functions.mjs';

let GalleryRouter = express.Router();

GalleryRouter.route('/gallery/:galleryId')
  .get(async function (req, res) {
    try {
      const gallery = new Gallery(req.params.galleryId)
      res.json(await gallery.init())
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

  .delete(authMiddleware, async function (req, res) {
    try {
      await new Gallery(req.params.galleryId).delete()
      res.json({ galleries: await Gallery.all() })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

  .put(authMiddleware, async function (req, res) {
    const { galleryId } = req.params
    try {
      const gallery = new Gallery(galleryId)
      const { name, description, isInCarousel } = req.body

      if (name != null && name !== '') {
        await gallery.setName(name)
      }
      if (description != null && description !== '') {
        await gallery.setDescription(description)
      }
      if (isInCarousel != null && isInCarousel !== '') {
        await gallery.setIsInCarousel(isInCarousel)
      }
      const updatedGallery = await new Gallery(galleryId).init()
      res.json({ gallery: updatedGallery })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

GalleryRouter.route('/gallery')
  // body : {name, parentId, file1, file2 ...}
  .post(authMiddleware, async function (req, res) {
    try {
      const { fields, files } = await uploadFiles(req)
      await addGallery(fields, Object.values(files))
      const galleries = await Gallery.all()
      res.json({ galleries })
    } catch (err) {
      res.json(err)
    }
  })

GalleryRouter.route('/galleries')
  .get(async (req, res) => {
    try {
      res.json({
        galleries: await Gallery.all()
      })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

GalleryRouter.route('/galleriesnotinlists')
  .get(async (req, res) => {
    try {
      res.json({
        galleries: await DB.all(queries.getGalleriesNotInLists)
      })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

GalleryRouter.route('/navgalleries')
  .get(async (req, res) => {
    try {
      const galleriesLists = await DB.all(queries.allGalleriesLists)
      const galleriesListsPictures = await DB.all(queries.getGalleriesListsPreviewPictures)

      const galleriesListWithPicture = await Promise.all(galleriesLists.map(async galleriesList => {
        return new Promise(async (resolve, reject) => {
          try {
            const picture = galleriesListsPictures.find(galleriesListsPicture => galleriesListsPicture.galleriesListId === galleriesList.id)
            if (picture != null) {
              galleriesList.picture = picture
            } else {
              galleriesList.picture = await DB.get(queries.getRandomPictureFromGalleriesList, { $id: galleriesList.id })
            }
            resolve(galleriesList)
          } catch (err) {
            reject(err)
          }
        })
      }))

      const galleries = await DB.all(queries.getGalleriesNotInLists)
      const galleriesWithPicture = await Promise.all(galleries.map(async gallery => {
        const picture = await DB.get(queries.getPreviewPicture, { $galleryId: gallery.id })
        if (picture != null) {
          gallery.picture = picture
        } else {
          gallery.picture = await DB.get(queries.getRandomPictureFromGallery, { $id: gallery.id })
        }
        return gallery
      }))
      res.json({
        galleriesLists: galleriesListWithPicture.reverse(),
        galleries: galleriesWithPicture.reverse()
      })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })

GalleryRouter.route('/carouselgalleries')
  .get(async (req, res) => {
    try {
      const galleries = await Gallery.carouselGalleries()
      res.json({
        galleries
      })
    } catch (err) {
      res.json({ err: err.toString() })
    }
  })





export default GalleryRouter

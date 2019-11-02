import fs from 'file-system'
import path from 'path'

import DB from '../../shared/db.mjs'
import { galleryPathConstructor } from "../../utils/gallery-path-constructor.mjs"
import queries from '../../utils/queries.mjs'
import config from '../../utils/config.mjs'
import { addPicture } from '../pictures/pictures-functions.mjs'

export const removeGallery = (galleryId) =>
    new Promise(async (resolve, reject) => {
        try {
            const gallery = await DB.get(queries.getGallery, { $id: galleryId })
                .then(gallery => {
                    if (gallery == null) {
                        throw "la galerie n'existe pas"
                    }
                    return gallery
                })

            const galleryPictures = await DB.all(queries.getPicturesByGallery, { $galleryId: gallery.id })

            galleryPictures.forEach(async picture => {
                await DB.run(queries.deletePicture, { $id: picture.id })
            })

            fs.rmdirSync(path.normalize(`${config.imageFolder}/${await galleryPathConstructor(gallery)}`))
            await DB.run(queries.deleteGallery, { $id: galleryId })
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })

export const addGallery = (fields, files) =>
    new Promise(async (resolve, reject) => {
        try {
            const { name: galleryName, parentId } = fields
            const galleryParent = parentId != null && await DB.get(queries.getGallery, { $id: parentId })
            const galleryPath = path.normalize(`${config.imageFolder}/${
                parentId == null
                    ? galleryName
                    : `${await galleryPathConstructor(galleryParent)}/${galleryName}`
                }`)

            await DB.run(queries.postGallery, { $name: galleryName, $parentId: parentId })
            const gallery = await DB.get(queries.getGalleryByName, { $name: galleryName })
            fs.mkdir(galleryPath, () => {
                Object.values(files).forEach(async file => {
                    await addPicture(file, gallery)
                })
            })
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })

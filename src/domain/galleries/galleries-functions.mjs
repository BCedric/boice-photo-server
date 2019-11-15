import fs from 'file-system'
import path from 'path'

import DB from '../../shared/db.mjs'
import { galleryPathConstructor } from "../../utils/gallery-path-constructor.mjs"
import queries from '../../utils/queries.mjs'
import config from '../../utils/config.mjs'
import { addPicture } from '../pictures/pictures-functions.mjs'

export const addGallery = (fields, files) =>
    new Promise(async (resolve, reject) => {
        try {
            const { name: galleryName, description, parentId } = fields
            const galleryParent = parentId != null && await DB.get(queries.getGallery, { $id: parentId })
            const galleryPath = path.normalize(`${config.imageFolder}/${
                parentId == null
                    ? galleryName
                    : `${await galleryPathConstructor(galleryParent)}/${galleryName}`
                }`)

            await DB.run(queries.postGallery, { $name: galleryName, $parentId: parentId, $description: description })

            const gallery = await DB.get(queries.getGalleryByName, { $name: galleryName })
            fs.mkdir(galleryPath, () => {
                files.forEach(async file => {
                    await addPicture(file, gallery)
                })
            })
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })

import fs from 'fs'
import path from 'path'

import DB from '../../shared/db.mjs'
import queries from '../../utils/queries.mjs'
import config from '../../utils/config.mjs'
import { addPicture } from '../pictures/pictures-functions.mjs'

export const addGallery = (fields, files) =>
    new Promise(async (resolve, reject) => {
        try {
            const makeDirectory = (path) => new Promise((resolve, reject) => {
                fs.mkdir(path, (err) => {
                    err != null ? reject(err) : resolve(null)
                })
            })
            const { name: galleryName, description, parentId } = fields
            const galleryPath = path.normalize(`${config.imageFolder}/${galleryName}`)
            await DB.run(queries.postGallery, { $name: galleryName, $parentId: parentId, $description: description })
            const gallery = await DB.get(queries.getGalleryByName, { $name: galleryName })
            await makeDirectory(galleryPath)
            await addPicture(files, gallery)
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })

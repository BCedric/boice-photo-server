import fs from 'file-system'
import path from 'path'
import sizeOf from 'image-size';

import config from '../../utils/config.mjs'
import queries from '../../utils/queries.mjs'
import DB from '../../shared/db.mjs'

export const addPicture = (files, gallery) =>
    new Promise(async (resolve, reject) => {
        try {
            await Promise.all(files.map(file => new Promise(async (resolve, reject) => {
                try {
                    const { name: pictureName, path: filePath } = file
                    const { width, height } = sizeOf(filePath)
                    const relativeGalleryPath = gallery != null
                        ? gallery.name
                        : ''
                    await DB.run(queries.postPicture, {
                        $name: pictureName,
                        $width: width,
                        $height: height,
                        $galleryId: gallery != null ? gallery.id : null,

                    })
                    fs.copyFileSync(filePath, path.normalize(`${config.imageFolder}/${relativeGalleryPath}/${pictureName}`))
                    resolve(null)
                } catch (error) {
                    reject(error)
                }
            })
            ))
            resolve(null)
        } catch (error) {
            reject(error)
        }
    })


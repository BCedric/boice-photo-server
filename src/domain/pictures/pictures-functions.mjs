import fs from 'file-system'
import path from 'path'
import sizeOf from 'image-size';

import config from '../../utils/config.mjs'
import queries from '../../utils/queries.mjs'
import DB from '../../shared/db.mjs'
import { galleryPathConstructor } from '../../utils/gallery-path-constructor.mjs';

export const addPicture = (file, gallery) =>
    new Promise(async (resolve, reject) => {
        try {
            const { name: pictureName, path: filePath } = file
            const { width, height } = sizeOf(filePath)
            const relativeGalleryPath = gallery != null
                ? await galleryPathConstructor(gallery)
                : ''
            await DB.run(queries.postPicture, {
                $name: pictureName,
                $address: path.normalize(
                    gallery == null
                        ? pictureName
                        : `${relativeGalleryPath}/${pictureName}`
                ),
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


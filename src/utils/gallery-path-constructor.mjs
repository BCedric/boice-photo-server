import DB from '../shared/db.mjs'
import queries from './queries.mjs'

export const galleryPathConstructor = gallery => new Promise(async (resolve, reject) => {
    try {
        if (gallery.parentId == null) {
            resolve(gallery.name)
        } else {
            const parentGallery = await DB.get(queries.getGallery, { $id: gallery.parentId })
            resolve(`${await galleryPathConstructor(parentGallery)}/${gallery.name}`)
        }
    } catch (error) {
        reject(error)
    }
})
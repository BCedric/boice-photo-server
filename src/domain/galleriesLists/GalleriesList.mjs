import Gallery from "../galleries/Gallery.mjs"
import DB from '../../shared/db.mjs'
import queries from '../../utils/queries.mjs'

class GalleriesList {
    constructor(id) {
        this.id = id
    }

    init() {
        return new Promise(async (resolve, reject) => {
            try {
                const galleriesList = await DB.get(queries.getGallery, { $id: this.id })
                const galleriesChildren = await DB.all(queries.getGalleriesList, { $parentId: this.id })
                galleriesList.children = await Promise.all(galleriesChildren.map(async child => {
                    const { id, name, description, parentId } = child
                    return await new Gallery(id, name, description, parentId)
                }))
                resolve(galleriesList)
            } catch (error) {
                reject(error)
            }
        })
    }

    static all() {
        return new Promise(async (resolve, reject) => {
            try {
                const galleriesLists = await DB.all(queries.allGalleriesLists)
                resolve(Promise.all(galleriesLists.map(async galleriesList => {
                    return await new GalleriesList(galleriesList.id).init()
                })))
            } catch (error) {
                reject(error)
            }

        })
    }
}

export default GalleriesList
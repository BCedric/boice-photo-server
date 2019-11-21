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
                const galleriesChildren = await DB.all(queries.getGalleriesListChildren, { $parentId: this.id })
                this.galleries = await Promise.all(galleriesChildren.map(async child => {

                    const { id, name, description, parentId } = child
                    const randPicture = await DB.get(queries.getRandomPictureFromGallery, { $id: id })
                    const gallery = await new Gallery(id, name, description, parentId)

                    return { ...gallery, randPicture: randPicture != null && `/picture/${randPicture.id}` }
                }))

                this.name = galleriesList.name
                this.description = galleriesList.description
                this.parentId = galleriesList.parentId

                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    update({ name }) {
        return new Promise(async (resolve, reject) => {
            try {
                await DB.run(queries.updateGallery, { $name: name, $id: this.id })
                resolve(null)
            } catch (err) {
                reject(err)
            }
        })
    }

    addGallery({ galleryId }) {
        return new Promise(async (resolve, reject) => {
            try {
                await DB.run(queries.updateGalleryParentId, { $parentId: this.id, $id: galleryId })
                resolve(null)
            } catch (err) {
                reject(err)
            }
        })
    }

    removeGallery({ galleryId }) {
        return new Promise(async (resolve, reject) => {
            try {
                await DB.run(queries.updateGalleryParentId, { $parentId: null, $id: galleryId })
                resolve(null)
            } catch (err) {
                reject(err)
            }
        })
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.name == null) {
                    await this.init()
                }

                this.galleries.forEach(async gallery => {
                    await DB.run(queries.updateGalleryParentId, { $parentId: null, $id: gallery.id })
                })
                await DB.run(queries.deleteGallery, { $id: this.id })
                resolve(null)
            } catch (err) {
                reject(err)
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
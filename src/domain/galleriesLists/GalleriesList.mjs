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
                this.galleries = await Promise.all(galleriesChildren.map(async child => {
                    const { id, name, description, parentId } = child
                    const randPicture = await DB.get(queries.getRandomPictureFromGallerie, { $id: id })
                    return { ...await new Gallery(id, name, description, parentId), randPicture: `/picture/${randPicture.id}` }
                }))

                this.name = galleriesList.name
                this.description = galleriesList.description
                this.parentId = galleriesList.parentId
                console.log('init', galleriesList);

                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    update({ name }) {
        //managing files
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
        //managing files
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
        //managing files
        return new Promise(async (resolve, reject) => {
            try {
                await DB.run(queries.updateGalleryParentId, { $parentId: null, $id: galleryId })
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
import fs from 'file-system'
import path from 'path'

import DB from '../../shared/db.mjs'
import queries from '../../utils/queries.mjs';
import Picture from '../pictures/Picture.mjs';
import config from '../../utils/config.mjs'
import { galleryPathConstructor } from "../../utils/gallery-path-constructor.mjs"

class Gallery {
    constructor(id, name, description, parentId) {
        this.id = id
        this.name = name
        this.description = description
        this.parentId = parentId
    }

    init() {
        return new Promise(async (resolve, reject) => {
            try {
                const gallery = await DB.get(queries.getGallery, { $id: this.id })
                if (gallery != null) {
                    this.name = gallery.name
                    this.description = gallery.description
                    this.parentId = gallery.parentId
                    this.pictures = await Picture.picturesFromGallery(this.id)
                }
                else reject("la galerie n'existe pas")
                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.name == null) {
                    await this.init()
                }
                const galleryPictures = await Picture.picturesFromGallery(this.id)
                galleryPictures.forEach(async picture => {
                    const { id, name, address, height, width, galleryId } = picture
                    await new Picture(id, name, address, height, width, galleryId).delete()
                })
                fs.rmdirSync(path.normalize(`${config.imageFolder}/${await galleryPathConstructor(this)}`))
                await DB.run(queries.deleteGallery, { $id: this.id })
                resolve(null)
            } catch (error) {
                reject(error)
            }
        })
    }

    setName(name) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.name == null) {
                    await this.init()
                }
                const galleryPath = path.normalize(`${config.imageFolder}/${await galleryPathConstructor(this)}`)

                const newGalleryPath = path.normalize(`${path.dirname(galleryPath)}/${name}`)
                const relativeNewGalleryPath = path.relative(config.imageFolder, newGalleryPath)
                fs.rename(galleryPath, newGalleryPath, (err) => {
                    if (err != null) {
                        throw err
                    }
                })
                await DB.run(queries.updateGallery, { $name: name, $id: this.id })
                const pictures = await Picture.picturesFromGallery(this.id)
                pictures.forEach(async picture => {
                    const pictureAddress = path.normalize(`${relativeNewGalleryPath}/${picture.name}`)
                    await picture.setAddress(pictureAddress)
                })
                resolve(this)
            } catch (error) {

                reject(error)
            }
        })
    }

    setDescription(description) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.name == null) {
                    await this.init()
                }
                await DB.run(queries.updateGalleryDescription, { $description: description, $id: this.id })
                resolve(this)
            } catch (error) {
                reject(error)
            }
        })
    }

    static all() {
        return new Promise(async (resolve, reject) => {
            try {
                const galleries = await DB.all(queries.allGalleries)
                resolve(await Promise.all(galleries.map(
                    async gallery => await new Gallery(gallery.id).init()
                )))
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default Gallery
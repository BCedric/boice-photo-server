import fs from 'fs'
import path from 'path'

import DB from '../../shared/db.mjs'
import queries from '../../utils/queries.mjs';
import config from '../../utils/config.mjs'


class Picture {
    constructor(id, name, height, width, galleryId) {
        this.id = id
        this.addr = `/picture/${this.id}`
        this.name = name
        this.height = height
        this.width = width
        this.galleryId = galleryId
    }


    init() {
        return new Promise(async (resolve, reject) => {
            try {
                const picture = await DB.get(queries.getPicture, { $id: this.id })
                if (picture.galleryId != null) {
                    const gallery = await DB.get(queries.getGallery, { $id: picture.galleryId })
                    this.address = path.normalize(`${gallery.name}/${picture.name}`)
                } else {
                    this.address = path.normalize(`${picture.name}`)
                }
                this.addr = `/picture/${picture.id}`
                this.name = picture.name
                this.height = picture.height
                this.width = picture.width
                this.galleryId = picture.galleryId
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
                const gallery = await DB.get(queries.getGallery, { $id: this.galleryId })
                await DB.run(queries.deletePicture, { $id: this.id })
                fs.unlinkSync(path.normalize(`${config.imageFolder}/${gallery.name}/${this.name}`))
                resolve(null)
            } catch (err) {
                reject(err)
            }
        })

    }

    setAddress(address) {
        return new Promise(async (resolve, reject) => {
            try {
                await DB.run(queries.updatePictureAddress, { $address: address, $id: this.id })
                resolve(this)
            } catch (error) {
                reject(error)
            }
        })

    }

    static all() {
        return new Promise(async (resolve, reject) => {
            try {
                const pictures = await DB.all(queries.allPictures)

                resolve(pictures.map(
                    picture => {
                        const { id, name, height, width, galleryId } = picture
                        return new Picture(id, name, height, width, galleryId)
                    }
                ))
            } catch (error) {
                reject(error)
            }
        })
    }

    static picturesFromGallery(galleryId) {
        return new Promise(async (resolve, reject) => {
            try {
                const pictures = await DB.all(queries.getPicturesByGallery, { $galleryId: galleryId })
                resolve(
                    pictures.map(picture => {
                        const { id, name, height, width, galleryId } = picture
                        return new Picture(id, name, height, width, galleryId)
                    })
                )
            } catch (error) {
                reject(error)
            }
        })
    }
}

export default Picture
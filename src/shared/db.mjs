import sqlite3 from 'sqlite3'
import config from '../utils/config'

const getDb = () => {
    const db = new sqlite3.Database(
        config.dbFile
    )
    db.configure("busyTimeout", 6000)
    return db
}

class DB {
    static get(query, params) {
        return new Promise((resolve, reject) => {
            const db = getDb()
            db.get(query, params, (err, entity) => {
                err == null ? resolve(entity) : reject(err)
            })
            db.close()
        })
    }

    static all(query, params) {
        return new Promise((resolve, reject) => {
            const db = getDb()
            db.all(query, params, (err, entities) => {
                err == null ? resolve(entities) : reject(err)
            })
            db.close()
        })
    }

    static run(query, params) {
        return new Promise((resolve, reject) => {
            const db = getDb()
            db.run(query, params, err => {
                err != null ? reject(err) : resolve(null)
            })
            db.close()
        })
    }
}

export default DB
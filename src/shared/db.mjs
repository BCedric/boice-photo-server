import sqlite3 from 'sqlite3'
import config from '../utils/config'

class DB {
    static get(query, params) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(
                config.dbFile
            )
            db.get(query, params, (err, entity) => {
                err == null ? resolve(entity) : reject(err)
            })
            db.close()
        })
    }

    static all(query, params) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(
                config.dbFile
            )
            db.all(query, params, (err, entities) => {
                err == null ? resolve(entities) : reject(err)
            })
            db.close()
        })
    }

    static run(query, params) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(
                config.dbFile
            )
            db.run(query, params, err => {
                err != null ? reject(err) : resolve(null)
            })
            db.close()
        })
    }
}

export default DB
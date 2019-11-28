import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import config from '../utils/config.mjs'
import DB from '../shared/db.mjs'
import { generateAuthToken } from '../domain/auth/auth-functions.mjs';

let AuthRouter = express.Router();

const queries = {
    getUser: 'SELECT * from Users WHERE name = $name',
    updateUserToken: 'UPDATE Users SET token = $token WHERE id = $id'
}

AuthRouter.route(`/auth`)
    .put(async function (req, res) {
        try {
            const { login, password } = req.body
            const user = await DB.get(queries.getUser, { $name: login })
            if (user != null) {
                const token = generateAuthToken(user)
                await DB.run(queries.updateUserToken, { $token: token, $id: user.id })
                await bcrypt.compare(password, user.password)
                    .then(auth => {
                        if (!auth) {
                            throw `le mot de passe ne correspond pas`
                        }
                        return auth
                    })
                user.token = token
                res.json({ user })
            } else {
                throw 'erreur d\'authentification'
            }
        } catch (err) {
            res.json({ err })
        }
    })

AuthRouter.route(`/checkauth`)
    .put(async function (req, res) {
        try {
            const { token } = req.body
            const decoded = jwt.verify(token, config.privateKey);
            res.json({ decoded })
        } catch (err) {
            res.json({ err })
        }
    })

AuthRouter.route(`/logout`)
    .put(async function (req, res) {
        try {
            await DB.run(queries.updateUserToken, { $id: req.body.id })
            res.json({ msg: 'coucou ' })
        } catch (err) {
            res.json({ err })
        }
    })

export default AuthRouter
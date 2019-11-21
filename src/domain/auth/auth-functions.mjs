import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import config from '../../utils/config.mjs'

const hashPassword = async (password, salt) => await bcrypt.hash(password, salt)

const genSalt = (saltRounds) => new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, async (err, salt) => {
        if (err) {
            reject(err)
        }
        resolve(salt)
    });
})

export const generatePassword = async (password) => {
    const saltRounds = 10
    const salt = await genSalt(saltRounds)
    return await hashPassword(password, salt)
}


export const generateAuthToken = (user) => {
    const token = jwt.sign({ _id: user.id }, config.privateKey, { expiresIn: 60 * 20 })
    return token
}

export const authMiddleware = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) return res.status(401).send("Access denied. No token provided.");
    try {
        const decoded = jwt.verify(token, config.privateKey);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send("Invalid token.");
    }
};
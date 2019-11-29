import express from 'express'
import bodyParser from 'body-parser'
import PictureRouter from './api/picture.mjs'
import UpdateDbRouter from './api/updateDb.mjs'
import GalleryRouter from './api/gallery.mjs'
import GalleriesListRouter from './api/galleriesList.mjs'
import SendEmailRouter from './api/sendEmail.mjs'
import AuthRouter from './api/auth.mjs'
import cors from 'cors'
import config from './utils/config.mjs'

var app = express();

const { port, baseURL } = config

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(baseURL, PictureRouter)
app.use(baseURL, UpdateDbRouter)
app.use(baseURL, GalleryRouter)
app.use(baseURL, AuthRouter)
app.use(baseURL, GalleriesListRouter)
app.use(baseURL, SendEmailRouter)

app.listen(port, process.env.ALWAYSDATA_HTTPD_IP)
console.log(`listenning on port ${port}`);

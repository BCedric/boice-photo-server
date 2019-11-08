import express from 'express'
import PictureRouter from './api/picture.mjs'
import UpdateDbRouter from './api/updateDb.mjs'
import GalleryRouter from './api/gallery.mjs'
import GalleriesListRouter from './api/galleriesList.mjs'
import SendEmailRouter from './api/sendEmail.mjs'
// import corsPrefetch from 'cors-prefetch-middleware'
import cors from 'cors'
import bodyParser from 'body-parser'

var app = express();

app.use(cors());
// app.use(corsPrefetch);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(PictureRouter)
app.use(UpdateDbRouter)
app.use(GalleryRouter)
app.use(GalleriesListRouter)
app.use(SendEmailRouter)

app.listen(8080);
console.log('listenning on localhos:8080');

import express from 'express'
import PictureRouter from './api/picture'
import UpdateDbRouter from './api/updateDb'
import GalleryRouter from './api/gallery'
import GalleriesListRouter from './api/galleriesList'
import SendEmailRouter from './api/sendEmail'
import corsPrefetch from 'cors-prefetch-middleware';
import cors from 'cors'
var bodyParser = require('body-parser');



var app = express();

app.use(cors());
app.use(corsPrefetch);
app.use(bodyParser.json());

app.use(PictureRouter)
app.use(UpdateDbRouter)
app.use(GalleryRouter)
app.use(GalleriesListRouter)
app.use(SendEmailRouter)

app.listen(8080);
console.log('listenning on localhos:8080');

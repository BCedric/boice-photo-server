import express from 'express'

import PictureRouter from './src/api/picture'
import corsPrefetch from 'cors-prefetch-middleware';
import cors from 'cors'


var app = express();

app.use(cors({origin: 'http://localhost:3000'}));
app.use(corsPrefetch);

app.get('/', function(req, res) {
    var accueil = 'accueilcoucou'
    res.json({page: accueil})
});

app.use(PictureRouter);

app.listen(8080);

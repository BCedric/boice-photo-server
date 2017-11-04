import express from 'express'
import PictureRouter from './src/api/picture'
import UpdateDbRouter from './src/api/updateDb'
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
app.use(UpdateDbRouter)

app.listen(8080);

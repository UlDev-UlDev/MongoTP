const express = require('express');
const randomstring = require("randomstring");
const MongoClient = require('mongodb').MongoClient;
const mi = require('mongoimport');
const fileUpload = require('express-fileupload');
const csv=require("csvtojson");

const app = express();
const url = 'mongodb://brice-bitot.fr:27017';
const dbName = 'import';

let db;

MongoClient.connect(url, function(err, client) {
    console.log("Connected successfully to server");
    db = client.db(dbName);
});

app.use(express.static('public'));
app.use(fileUpload({
    useTempFiles: true,
    debug: true
}));

app.get('/', (req, res) => {
    res.redirect('/import');
});

app.get('/import/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.post('/import/file',(req, res) => {
    let id = randomstring.generate(16);
    console.log(req.files.file.tempFilePath);
    csv()
        .fromFile(req.files.file.tempFilePath)
        .then((data)=>{
            let config = {
                fields: data,                     // {array} data to import
                db: 'import',                     // {string} name of db
                collection: id,        // {string|function} name of collection, or use a function to
                host: 'brice-bitot.fr:27017',
            };
            mi(config);
            res.redirect('/tableau/' + id);
        })
});

app.get('/tableau/:id', (req, res) => {
    let id = req.params.id;
    db.collection(id).find({}).toArray((err, docs) => {
        if (err) {
            console.log(err)
            throw err
        }
        res.send(docs);
    });
});

app.get('tableau/:id/detail/:id_detail', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    res.status(200).json("détail");
});

app.listen(8080);
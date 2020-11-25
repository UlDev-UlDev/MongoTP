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
            res.redirect('/' + id);
        })
});

app.get('/import/:id', (req, res) => {
    let id = req.params.id;
    res.sendFile(__dirname + '/views/table.html');
});

app.get('/api/:id/:page_num', (req, res) => {
    let id = req.params.id;
    let page_num = req.params.page_num;
    let limit = 10;
    let skips = limit * (page_num - 1);
    db.collection(id).find({}).limit(limit).toArray((err, docs) => {
        if (err) {
            console.log(err);
            throw err;
        }
        db.collection(id).countDocuments({}, (err, count) => {
            res.status(200).json({
                "totalPage": count / limit,
                "pageNumber": page_num,
                "data": docs
            });
        })
    });
});

app.get('/import/:id/:id_detail', (req, res) => {
    res.status(200).json("détail");
});

app.get('/api/:id/:id_detail', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    db.collection(id).find({"id": id_detail}).toArray((err, docs) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(docs);
    });
});

app.get('/api/:id/:id_detail/update', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    let dataToUpdate = req.params.dataToUpdate;
    db.collection(id).updateOne({"id": id_detail}, {$set: dataToUpdate});
    res.send(200);
});

app.get('/api/:id/:id_detail/delete', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    db.collection(id).deleteOne({"id": id_detail});
    res.redirect('/import/' + id);
});

app.listen(8080);
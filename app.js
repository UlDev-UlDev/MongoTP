const express = require('express');
const randomstring = require("randomstring");
const MongoClient = require('mongodb').MongoClient;
const mi = require('mongoimport');
const fileUpload = require('express-fileupload');
const csv = require("csvtojson");
const bodyParser = require('body-parser');
const app = express();
const url = 'mongodb://brice-bitot.fr:27017';
const dbName = 'import';
const multer = require("multer");
const path = require("path")
const fs = require('fs');

const upload = multer({
    dest: "/Images"
    // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

let db;

MongoClient.connect(url, function (err, client) {
    console.log("Connected successfully to server");
    db = client.db(dbName);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.static('Images'));
app.use(express.static('my_model'));

app.use(fileUpload({
    useTempFiles: true,
}));

app.get('/image/:name', (req, res) => {
    let name = req.params.name;
    res.sendFile(__dirname + '/views/Image.html');
});

app.get('/', (req, res) => {
    res.redirect('/import');
});

app.get('/import/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/upload/', (req, res) => {
    res.sendFile(__dirname + '/views/upload.html');
});

app.get('/historique/', (req, res) => {
    res.sendFile(__dirname + '/views/historique.html');
});

app.post('/import/file', (req, res) => {
    let id = randomstring.generate(16);
    console.log(req.files.file.tempFilePath);
    csv()
        .fromFile(req.files.file.tempFilePath)
        .then((data) => {
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

app.get('/api/:id', (req, res) => {
    let id = req.params.id;
    let page_num = req.query.draw;
    let limit = 10;
    let skips = limit * (page_num - 1);
    db.collection(id).find({}).skip(skips).limit(limit).toArray((err, docs) => {
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
    res.status(200).sendFile(__dirname + '/views/detail.html');
});

app.get('/tensorflow/historique', (req,res)=> {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("tensorflow");
        dbo.collection("historique").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.end(JSON.stringify(result));
            db.close();
        });
    });
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

app.post('/api/:id/:id_detail/update', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    let dataToUpdate = req.body.dataToUpdate;
    console.log(dataToUpdate);
    db.collection(id).updateOne({"id": id_detail}, {$set: dataToUpdate});
    res.send(200);
});

app.post('/api/:id/:id_detail/delete', (req, res) => {
    let id = req.params.id;
    let id_detail = req.params.id_detail;
    db.collection(id).deleteOne({"id": id_detail});
    res.redirect('/import/' + id);
});

app.post(
    "/tensorflow/saveImage",
    upload.single("file"), (req, res) => {
        console.log(req.files.file)
        const tempPath = req.files.file.tempFilePath;
        const targetPath = path.join(__dirname, "./Images/" + req.files.file.name);

        if (path.extname(req.files.file.name).toLowerCase() === ".png" || path.extname(req.files.file.name).toLowerCase() === ".jpg") {
            fs.rename(tempPath, targetPath, err => {
                if (err) throw err;

                res
                    .status(200)
                    .contentType("text/plain")
                    .end("File uploaded!");
            });
        } else {
            fs.unlink(tempPath, err => {
                if (err) throw err;

                res
                    .status(403)
                    .contentType("text/plain")
                    .end("Only .png files are allowed!");
            });
        }
    });

app.post("/tensorflow/saveImageInfo", (req,res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("tensorflow");
        var imageInfo = {
            name: req.body.name,
            size: req.body.size,
            filePath: req.body.filePath,
            date: req.body.date,
            rate: req.body.rate,
            type: req.body.type,
        };
        dbo.collection("historique").insertOne(imageInfo, function(err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
});

app.listen(8080);
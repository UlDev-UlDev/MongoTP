const express = require('express');
const randomstring = require("randomstring");
const mongodb = require('mongodb')
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

app.use(fileUpload({
    useTempFiles: true,
}));

app.get('/uploaded_images/:name', (req, res) => {
    let name = req.params.name;
    res.sendFile(__dirname + '/views/Image.html');
});

app.get('/upload/', (req, res) => {
    res.sendFile(__dirname + '/views/upload.html');
});

app.get('/historique/', (req, res) => {
    res.sendFile(__dirname + '/views/historique.html');
});

app.get('/tensorflow/historique', (req,res)=> {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("tensorflow");
        dbo.collection("historique").find({}).sort({date: -1}).toArray(function(err, result) {
            if (err) throw err;
            res.end(JSON.stringify(result));
            db.close();
        });
    });
});

app.post('/tensorflow/delete/:id', (req,res)=> {
    let id = req.params.id;
    console.log(id);
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("tensorflow");
        var myquery = { _id: new mongodb.ObjectID(id) };
        dbo.collection("historique").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Ligne supprimée")
            db.close();
            res.sendStatus(200);
        });
    });
});

app.post(
    "/tensorflow/saveImage",
    upload.single("file"), (req, res) => {
        const tempPath = req.files.file.tempFilePath;
        const file_name = req.files.file.name;
        const targetPath = path.join(__dirname, "./public/uploaded_images/" + randomstring.generate(16) + file_name);

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

const express = require('express')
const app = express()

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://brice-bitot.fr:27017';
const dbName = 'parkingApi';
let db

MongoClient.connect(url, function(err, client) {
    console.log("Connected successfully to server");
    db = client.db(dbName);
});

app.get('/import', (req, res) => {
    res.status(200).json("import")
});

app.get('/tableau/', (req, res) => {
    res.status(200).json("ok")
});

app.get('/detail/', (req, res) => {
    res.status(200).json("ok")
});

app.listen(8080);
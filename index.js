const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const port = 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dm8wp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

client.connect(err => {
    
    const adminsCollection = client.db("creative-service").collection("admins");
    const servicesCollection = client.db("creative-service").collection("services");
    const orderCollection = client.db("creative-service").collection("orders");
    const reviewsCollection = client.db("creative-service").collection("reviews");
    
    
    // POST & GET ORDER
    app.get('/orders', (req, res) => {
        orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addOrder', (req, res) => {
        const file = req.files.file;
        const service = req.body.service;
        const description = req.body.description;
        const name= req.body.name;        
        const email= req.body.email;        
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        orderCollection.insertOne({ name, email, service, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
        })
    })

    // POST & GET REVIEW

    app.get('/review', (req, res) => {
        reviewsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addReview', (req, res) => {
        const name = req.body.name;
        const company = req.body.company;
        const review = req.body.review;

        reviewsCollection.insertOne({name, company, review})
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    // POST & GET SERVICE

    app.get('/services', (req, res) => {
        servicesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const service = req.body.service;
        const description = req.body.description;       
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({ service, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
        })
    })

    // POST & GET ADMIN

    app.get('/admin', (req, res) => {
        adminsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        
        adminsCollection.insertOne({email})
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    // Admin Check

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;        
        adminsCollection.find({email: email})
            .toArray((err, documents) => {
                res.send(documents.length > 0)
            })
    });
})


app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(process.env.PORT || port)
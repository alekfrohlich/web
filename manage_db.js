// Script for managing the posts MongoDB
// Run "node manag_db.js -h" for help
var fs = require('fs');

const mongoClient = require('mongodb').MongoClient;
const URL         = 'mongodb://localhost:27017/';
const DBNAME      = 'mathblog';

// This will be subbed when the post form is functional on site
// const PATH      = '/posts/12-12-2021-alekfr-trigonometric-functions.html';
const PATH      = '/posts/12-13-2021-alekfr-basis-in-infinite-dimensional-vector-spaces.html';
// const POSTNAME  = 'Trigonometric Functions';
const POSTNAME  = 'Basis in Infinite Dimensional Vector Spaces';
const AUTHOR    = 'alekfr';
const POSTDATE  = '12-13-2021';
const POST      = fs.readFileSync('.'+PATH).toString('utf-8');

let option;
if (process.argv.length < 2)
    option = 'Default';
else
    option = process.argv[2];

switch (option) {
    case '-c': // create database
        mongoClient.connect(URL+DBNAME, function(err, db) {
            if (err) throw err;
            console.log(`Database ${DBNAME} created!`);
            let dbo = db.db(DBNAME);
            dbo.createCollection('posts', function(err, res) {
                if (err) throw err;
                console.log('Collection posts created!');
                db.close();          
            });
        });
        break;
    case '-d': // delete database
        mongoClient.connect(URL, function(err, db) {
            if (err) throw err;
            let dbo = db.db(DBNAME);
            dbo.dropDatabase(function(status) {
                console.log(`Dropped mathblog database!`);
                db.close();
            });
        });
        break;
    case '-i': // insert hardcoded post
        mongoClient.connect(URL, function(err, db) {
            if (err) throw err;
            let dbo = db.db(DBNAME);
            let post = {
                path:   PATH,
                name:   POSTNAME,
                author: AUTHOR,
                date:   POSTDATE,
                latext: POST,
            };
            dbo.collection('posts').insertOne(post, function(err, res) {
                if (err) throw err;
                console.log(`Post ${POSTNAME} by ${AUTHOR} inserted!`);
                db.close();
            });
        });
        break;
    case '-l': // list posts
        mongoClient.connect(URL, function(err, db) {
            if (err) throw err;
            let dbo = db.db(DBNAME);
            dbo.collection('posts').find({}).toArray(function(err, res) {
                if (err) throw err;
                console.log(res);
                db.close();
            });
        });
        break;
    case '-h':
    default:
        console.log('Usage: "node manage_db.js <arg>" where <arg> is one of -c, -d, -i, -l');
}

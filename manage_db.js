// Script for managing the posts MongoDB
// Run "node manag_db.js -h" for help
var fs = require('fs');

const mongoClient = require('mongodb').MongoClient;
const URL         = 'mongodb://localhost:27017/';
const DBNAME      = 'mathblog';

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
        mongoClient.connect(URL, (err, db) => {
            if (err) throw err;
            let dbo = db.db(DBNAME);
            let post1 = {
                path:   '/posts/12-12-2021-alekfr-trigonometric-functions.html',
                name:   'Trigonometric Functions',
                author: 'alek',
                date:   '12-12-2021',
                latext: fs.readFileSync('./dev/posts/12-12-2021-alekfr-trigonometric-functions.html').toString('utf-8'),
            };
            let post2 = {
                path:   '/posts/12-13-2021-alekfr-basis-in-infinite-dimensional-vector-spaces.html',
                name:   'Basis in Infinite Dimensional Vector Spaces',
                author: 'alek',
                date:   '12-13-2021',
                latext: fs.readFileSync('./dev/posts/12-13-2021-alekfr-basis-in-infinite-dimensional-vector-spaces.html').toString('utf-8'),
            };
            posts = [post1, post2];
            dbo.collection('posts').insertMany(posts, function(err, res) {
                if (err) throw err;
                console.log(`Posts inserted!`);
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

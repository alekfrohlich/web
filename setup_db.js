// Script for setting up the mathblog database
// MongoDB comes with an interactive shell (in my case, D:/MongoDB/server/5.0/bin/mongo.exe)
// There you can delete any remains of another MathBlog installation and list
// contents of collections.
var fs = require('fs');

const mongoClient = require('mongodb').MongoClient;
const URL         = 'mongodb://localhost:27017/';
const DBNAME      = 'mathblog';

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
let posts = [post1, post2];

run = async () => {
    db = await mongoClient.connect(URL+DBNAME);
    let dbo = db.db(DBNAME);
    console.log(`Database ${DBNAME} created!`);

    // Creates
    await dbo.createCollection('posts');
    await dbo.createCollection('users');
    
    // Inserts
    await dbo.collection('posts').insertMany(posts);
    console.log('Posts inserted!');
    await dbo.collection('users').insertOne({nickname: 'alek', password: 'pass'});
    console.log('User inserted!');
    await db.close();
};
run();

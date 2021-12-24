// NodeJS Blog. Makes use of the following technologies:
// 1. express for routing
// 2. express-session for managing cookies
// 3. https for tunneled http requests and responses
// 4. MongoDB for storing user and post information
// 5. page_components for Server Side Rendering
// The documentation of this file reflects the needs of those whom will maintain it.

// TODO List
// Favarim e Nícolas:
// 1. Melhorar o design da aboutPage e da página das postagens, agora está horrível.
// 2. Melhorar a segurança do site. As senhas são salvas em plain-text e a MemoryStore de cookies
//    aparentemente é leaky.
// 3. Mostrar o nome do usuário logado.

var fs = require("fs");
var https = require("https");

// module = require(<module>) returns an object which 'serves', in the pratical sense, as a namespace.
// Thus, if you declare a function f1 inside <module>, then module.f1 is how you access it inside the 
//     file that made the require.
// The same holds for Types. If you declare a class C1 inside <module>, you access it via module.C1
var mongoClient = require('mongodb').MongoClient;
const express   = require('express');
const session   = require('express-session');
const app       = express();

const components = require('./page_components');
// The next piece of code is a Joke that mimicks "using <namespace>" of C++
for (const component in components) {
    console.log('Importing component: ' + component);
    eval(`var ${component} = components.${component}`);
}

const DBURL   = 'mongodb://localhost:27017/';
const DBNAME  = 'mathblog';

const hostname = '127.0.0.1';
const port = 3000;


// Serve static files
app.use('/css',    express.static('css'));
app.use('/js',     express.static('js'));
app.use('/images', express.static('images'));

// To access form data inside route
app.use(express.urlencoded({ extended: true }))
// To manage session
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true})); //TODO: secure secret

// Log activity
app.all('*', (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

function loggedIn(sess) {
    return 'nickname' in sess;
}

// Routes
// app.get (or post, put, etc.) accepts either a RegEx or (...)
app.get(/^\/(index)?$/, (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar(loggedIn(req.session)));
    page.addBodyComponent(new Posts());
    // Blocking code is almost inexistent in JS. Instead of blocking, it is typical
    // for functions to return Promises (Java's Future). Since Promise<Type> is not Type,
    // you can't handle it as if it were Type. If you need to access the result, you must
    // call Promise.then() as is done in the next line. The argument of then is a callback function
    // Callback functions are called when the asynchronous task is complete. Notice that only the code
    // inside callback waits for the Promise to be resolved, everything after it will execute immediately.
    page.render().then(renderedPage => {
        res.send(renderedPage);
    }); // then() returns another Promise, so that you can return from the callback and use the value on yet another
        // then(). This only makes sense if callback has asynchronous code though.
    // For example, the function will reach its end before res.send(renderedPage) is called.
    // Further info on Promises and async programming in general can be found on: https://javascript.info/promise-basics
});
app.get('/about', (req, res) => {
    let page = new Page('About | MathBlog');
    page.addBodyComponent(new Navbar(loggedIn(req.session)));
    page.addHeadComponent(new MathJax());
    page.addBodyComponent(new Text('This is a Math Blog.'));
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.get('/login', (req, res) => {
    let queryString = req.query;
    let page = new Page('Login | MathBlog');
    page.addBodyComponent(new Navbar(loggedIn(req.session)));
    page.addBodyComponent(new Login(queryString.error));
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.post('/login', (req, res) => {
    nickname = req.body.nickname;
    password = req.body.password;
    console.log({nickname:nickname, password: password});
    mongoClient.connect(DBURL, (err, db) => {
        let dbo = db.db(DBNAME);
        dbo.collection('users').findOne({nickname: nickname, password: password}, (err, user) => {
            if (user == null) { // Invalid usr/pwd combination
                let parameters = new URLSearchParams({error: 'Invalid Nickname/Password combination!'});
                res.redirect(`/login?${parameters.toString()}`);
            } else { // User exists, sign-in
                req.session.nickname = nickname;
                res.redirect('/');
            }
            db.close();
        });
    });
});
app.get('/signup', (req, res) => {
    let page = new Page('Sign-Up | MathBlog');
    let queryString = req.query;
    page.addBodyComponent(new Navbar(loggedIn(req.session)));
    page.addBodyComponent(new Signup(queryString.error));
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.post('/signup', (req, res) => {
    nickname = req.body.nickname;
    password = req.body.password;
    mongoClient.connect(DBURL, (err, db) => {
        let dbo = db.db(DBNAME);
        //TODO: Improve password storage
        dbo.collection('users').findOne({nickname: nickname}, (err, user) => {
            if (user == null) { // User doesn't exist, so create one
                dbo.collection('users').insertOne({nickname: nickname, password: password}).then(() => {db.close();})
                req.session.nickname = nickname;
                res.redirect('/');
            } else { // User already exists
                let parameters = new URLSearchParams({error: 'This Nickname is already in use!'});
                res.redirect(`/signup?${parameters.toString()}`);
                db.close();
            }
        });
    });
});
app.get('/logout', (req, res) => {
    req.session.destroy( err => {
        res.redirect('/');
    })
});
app.get('/post', (req, res) => { //TODO: write NewPost component
    // Not logged in
    if (!req.session.nickname) {
        res.redirect('/'); //TODO: warn user
    } else {
        let page = new Page('New Post | MathBlog');
        page.addBodyComponent(new Navbar(loggedIn(req.session)));
        page.addBodyComponent(new NewPost());
        page.render().then(renderedPage => {
            res.send(renderedPage);
        });
    }

});
app.post('/post', (req, res) => {
    // Not logged in
    if (!req.session.nickname) {
        res.redirect('/'); //TODO: warn user
    } else {
        title = req.body.title;
        latext = req.body.postbody;
        let date = new Date();
        let year  = date.getFullYear();
        let month = date.getMonth();
        let day   = date.getDay();
        date = `${month}-${day}-${year}`;
        let path = '/posts/'+date+'-'+title.toLowerCase().replaceAll(' ', '-');
        let post = {
            path:   path,
            name:   title,
            author: req.session.nickname,
            date:   date,
            latext: latext,
        };
        mongoClient.connect(DBURL, (err, db) => {
            let dbo = db.db(DBNAME);
            dbo.collection('posts').insertOne(post, (err, post) => {
                if (err) throw err;
                console.log(`Post ${title} by ${req.session.nickname} inserted!`);
                db.close();
            });
            res.redirect('/');
        });
    }
});
app.get(/^\/posts/, (req, res) => {
    mongoClient.connect(DBURL, (err, db) => {
        let dbo = db.db(DBNAME);
        dbo.collection('posts').findOne({path: req.url}, (err, post) => {
            db.close();
            // There should be a unique result since path is Primary Key
            let page = new Page(post.name+' | Mathblog');
            page.addHeadComponent(new MathJax());
            page.addBodyComponent(new Navbar());
            page.addBodyComponent(new Text(post.latext));
            page.render().then(renderedPage => {
                res.send(renderedPage);
            });
        });
    });
});

https.createServer(
    {
        key:  fs.readFileSync('sslcerts/server.key'),
        cert: fs.readFileSync('sslcerts/server.cert'),
    },
    app
).listen(port, () => {
    console.log(`Server running at https://${hostname}:${port}/`);
});

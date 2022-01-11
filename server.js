// NodeJS Blog. Makes use of the following technologies:
// 1. express for routing
// 2. express-session for managing cookies
// 3. https for tunneled http requests and responses
// 4. MongoDB for storing user and post information
// 5. page_components for Server Side Rendering
// The documentation of this file reflects the needs of those whom will maintain it.

// TODO List
// 
// SEGUNDA ENTREGA:
// - Fazer o botao da navbar da tela mobile
// - Escrever mais coisas na pagina de about 
// - Melhorar o design da página das postagens 
//      -> deixar as figuras da tela de postagens todas iguais fica estranho
// - Deixar bonito o titulo e o nome do autor na pagina de cada post
// - checar com o professor se os dados do 
//    formulario podem ser enviados da forma como est'a 
// - checar com o professor se a verificacao do 
//    formulario como est'a 'e suficiente
// - checar com o professor se os eventos estao ok
// - fazer o css das mensagens dos eventos e deixar as mensagens do lado e nao embaixo:
//      -> sign up nickname - invalid nickname
//      -> sign up password - different password e invalid first e second password 
//      -> sign in nickname - vazio
//      -> sign in password - vazio
// - fazer o css das condicoes da senha
// - mudar o css do "hello, nickname" para nao ficar parecendo um link igual aos outros do navbar
// - deixar os botoes de edit e delete do post bonitos
// - arrumar a area de escrever e editar os posts -> nao ta diminuindo junto com o tamanho da janela 
// - a 'area de clicar do MathBlog ta indo muito para a direita -> remover isso, eh estranho
// - pq tem o home e o MathBlog? -> um nao eh suficiente para ir na pagina dos posts?
// 
// TERCEIRA ENTREGA:
// - deletar o post no bd 
// - Melhorar a segurança do site. As senhas são salvas em plain-text e a MemoryStore de cookies
//    aparentemente é leaky.
// - passar so o nickname para o navbar e nao todo a session - faz diferenca?

var fs = require("fs");
var https = require("https");

// module = require(<module>) returns an object which 'serves', in the pratical sense, as a namespace.
// Thus, if you declare a function f1 inside <module>, then module.f1 is how you access it inside the 
//     file that made the require.
// The same holds for Types. If you declare a class C1 inside <module>, you access it via module.C1
var mongoClient = require('mongodb').MongoClient;
var ObjectId    = require('mongodb').ObjectId;
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

function canEdit(sess, author) {
    return sess.nickname === author;
}

// Routes
// app.get (or post, put, etc.) accepts either a RegEx or (...)
app.get(/^\/(index)?$/, (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
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
    page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
    page.addHeadComponent(new MathJax());
    let post = {
        title:   "About MathBlog",
        author: "MathBlog",
        date:   "",
        latext: 'This is a Math Blog.',
    };
    page.addBodyComponent(new Text(false, post));
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.get('/login', (req, res) => {
    let queryString = req.query;
    let page = new Page('Login | MathBlog');
    page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
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
    page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
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
    if (!loggedIn(req.session)) {
        res.redirect('/'); //TODO: warn user
    } else {
        let page = new Page('New Post | MathBlog');
        page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
        page.addBodyComponent(new NewPost());
        page.render().then(renderedPage => {
            res.send(renderedPage);
        });
    }

});
app.post('/post', (req, res) => {
    // Not logged in
    if (!loggedIn(req.session)) {
        res.redirect('/'); //TODO: warn user
    } else {
        title = req.body.title;
        latext = req.body.postbody;
        let date = new Date();
        let year  = date.getFullYear();
        let month = date.getMonth();
        let day   = date.getDay();
        date = `${month}-${day}-${year}`;
        let post = {
            title:   title,
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
    let post_id = req.url.substr(7);
    mongoClient.connect(DBURL, (err, db) => {
        let dbo = db.db(DBNAME);
        dbo.collection('posts').findOne({_id: ObjectId(post_id)}, (err, post) => {
            db.close();
            if (post == null) {
                console.log("post does not exist");
                res.redirect('/'); //TODO: warn user
            } else {
                let page = new Page(post.title+' | Mathblog');
                page.addHeadComponent(new MathJax());
                page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
                page.addBodyComponent(new Text(canEdit(req.session, post.author), post));
                page.render().then(renderedPage => {
                    res.send(renderedPage);
                });
            }
        });
    });
});

app.get(/^\/edit-post/, (req, res) => {
    if (!loggedIn(req.session)) {
        res.redirect('/'); //TODO: warn user
    } else {
        mongoClient.connect(DBURL, (err, db) => {
            let dbo = db.db(DBNAME);
            let post_id = req.url.substr(11);
            dbo.collection('posts').findOne({_id: ObjectId(post_id)}, (err, post) => {
                db.close();
                if (post == null) {
                    console.log("post does not exist");
                    res.redirect('/'); //TODO: warn user
                }else if (!canEdit(req.session, post.author)) {
                    console.log("cannot edit");
                    res.redirect('/'); //TODO: warn user
                }else {
                    let page = new Page('Edit Post | MathBlog');
                    page.addBodyComponent(new Navbar(loggedIn(req.session), req.session));
                    page.addBodyComponent(new EditPost(post));
                    page.render().then(renderedPage => {
                        res.send(renderedPage);
                    });
                }
            });
        });
    }
});

app.post(/^\/edit-post/, (req, res) => {
    // Not logged in
    if (!loggedIn(req.session)) {
        res.redirect('/'); //TODO: warn user
    } else {
        title = req.body.title;
        latext = req.body.postbody;
        let date = new Date();
        let year  = date.getFullYear();
        let month = date.getMonth();
        let day   = date.getDay();
        date = `${month}-${day}-${year}`;
        let post = {
            title:   title,
            author: req.session.nickname,
            date:   date,
            latext: latext,
        };
        mongoClient.connect(DBURL, (err, db) => {
            let dbo = db.db(DBNAME);

            dbo.collection('posts').replaceOne({_id: ObjectId(req.url.substr(11))} , post, (err, post) => {
                if (err) throw err;
                console.log(`Post ${title} updated by ${req.session.nickname} inserted!`);
                db.close();
            });
            res.redirect('/');
        });
    }
});

app.delete(/^\/delete-post/, (req, res) => {
    // Not logged in
    if (!loggedIn(req.session)) {
        res.redirect('/'); //TODO: warn user
    } else {
        mongoClient.connect(DBURL, (err, db) => {
            let dbo = db.db(DBNAME);
            dbo.collection('posts').deleteOne({_id: ObjectId(req.url.substr(11))}, (err, result) => {
                if (err) throw err;
                console.log({result:result})
                console.log(`Post ${title} deleted by ${req.session.nickname}!`);
                db.close();
            });
            res.redirect('/');
        });
    }
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

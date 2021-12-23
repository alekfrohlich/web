// Proximos passos: assim que o Favarin terminar de escrever o HTML/CSS/JS dos formulários,
// vamos poder salvar cadastros no banco mathblog. Depois poderemos implementar a postagem de novos posts.
// Teremos três desafios:
// 2. Como usar cookies para manter o estado de usuário logado?
//  2.1 Como fazer uma Navbar alternativa pra usuário logado (os botões de sign-in e sign-up devem desaparecer
//      e os botões de post e sign-out devem aparecer em seus lugares).
// 3. Melhorar o design da aboutPage e da página das postagens, agora está horrível.

var fs = require("fs");
var https = require("https");

var mongoClient = require('mongodb').MongoClient;
const express   = require('express');
const app       = express();

const components = require('./page_components');
// The next piece of code is a Joke
// Using namespace page_components
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

// To handle login/signup POSTs
app.use(express.urlencoded({ extended: true }))

// Log activity
app.all('*', (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.get(/^\/(index)?$/, (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar());
    page.addBodyComponent(new Posts());
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.get('/about', (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar());
    page.addHeadComponent(new MathJax());
    page.addBodyComponent(new Text('This is a Math Blog.'));
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.get('/login', (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar());
    page.addBodyComponent(new Login());
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.get('/signup', (req, res) => {
    let page = new Page('Home | MathBlog');
    page.addBodyComponent(new Navbar());
    page.addBodyComponent(new Signup());
    page.render().then(renderedPage => {
        res.send(renderedPage);
    });
});
app.post('/signup', (req, res) => {
    console.log(req.body);
    res.end();
});
app.get(/^\/posts/, (req, res) => {
    mongoClient.connect(DBURL, (err, db) => {
        let dbo = db.db(DBNAME);
        dbo.collection('posts').findOne({path: req.url}, (err, post) => {
            db.close().then(() => {
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
});

https.createServer(
    {
        key:  fs.readFileSync('sslcerts/server.key'),
        cert: fs.readFileSync('sslcerts/server.cert'),
    },
    app
).listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

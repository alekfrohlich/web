// Proximos passos: assim que o Favarin terminar de escrever o HTML/CSS/JS dos formulários,
// vamos poder salvar cadastros no banco mathblog. Depois poderemos implementar a postagem de novos posts.
// Teremos três desafios:
// 1. Como coletar e armazenar de forma segura as credenciais dos usuários?
// 2. Como usar cookies para manter o estado de usuário logado?
//  2.1 Como fazer uma Navbar alternativa pra usuário logado (os botões de sign-in e sign-up devem desaparecer
//      e os botões de post e sign-out devem aparecer em seus lugares).
// 3. Melhorar o design da aboutPage e da página das postagens, agora está horrível.

var fs          = require('fs');
var http        = require('http');
var path        = require('path');
var mongoClient = require('mongodb').MongoClient;

const DBURL   = 'mongodb://localhost:27017/';
const DBNAME  = 'mathblog';

const hostname = '127.0.0.1';
const port = 3000;

const extNameToContentType = {
    html: 'text/html',
    js:   'text/javascript',
    css:  'text/css',
    map:  'text/css',
    ico:  'image/x-icon',
    svg:  'image/svg+xml',
}


class Page {
    constructor(title){
        this.title = title;
        this.bodyComponents = [];
        this.headComponents = [];
    }
    async render(){
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
                <title>${this.title}</title>
                ${(await Promise.all(this.headComponents.map(async (hc) => hc.render()))).join('\n')}
                <link rel="stylesheet" href="/css/style.css">
            </head>
            <body>
                ${(await Promise.all(this.bodyComponents.map(async (bc) => bc.render()))).join('\n')}
            </body>
            </html>
        `;
    }
    addBodyComponent(c) { this.bodyComponents.push(c); }
    addHeadComponent(c) { this.headComponents.push(c); }
}


class Navbar {
    constructor() {}
    async render() {
        return `
            <div class="navbar">
                <div class="container">
                    <a class="logo" href="/">Math<span>Blog</span></a>
                    <img id=open-menu class="mobile-menu" src="/images/menu.svg" alt="Open Navigation">
                    <nav>
                        <img id=exit-menu class="mobile-menu-exit" src="/images/exit.svg" alt="Close Navigation">
                        <ul class="primary-nav">
                            <li><a href="/index.html">Home</a></li>
                            <li><a href="/about.html">About</a></li>
                        </ul>
                        <ul class="login-nav">
                            <li><a href="#">Sign in</a></li>
                            <li><a href="#">Sign up</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    }
}


class Posts {
    constructor(post_db) { this.post_db = post_db; }
    async render() {
        let db = await mongoClient.connect(DBURL);
        let dbo = db.db(DBNAME);
        let res = await dbo.collection('posts').find({}).toArray();
        await db.close();
        
        return `
            <section class="posts">
                <div class="container">
                    <h1>Latest Posts</h1>
                    <ul>
                        ${res.map(post => `
                        <li>
                            <a href="${post.path}" class="post-title">${post.name}
                                <cite class="post-cite">${post.author}</cite>
                                <img src="images/illustration.svg" class="post-image" alt="Illustration">
                            </a>
                        </li>
                        `).join('\n')}
                    </ul>
                </div>
            </section>
        `;
    }
}


// This should be forked into a Post component.
class Text {
    constructor(text) { this.text = text; }
    async render() {
        return this.text;
    }
}


class MathJax {
    constructor() {}
    async render() {
        return `
            <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
            <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        `;
    }
}


// Register request event
const server = http.createServer((req, res) => {
    try {

        console.log(`${req.method} ${req.url}`);

        let filePath = '.' + req.url;
        if (filePath == './')
            filePath = './index.html';

        const extName = path.extname(filePath).slice(1);
        console.log(extName);
        const contentType = extNameToContentType[extName];

        // Dynamically build html from JS components
        if (extName == 'html') {
            (async () => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                let page;
                if (req.url === '/' || req.url === '/index.html') {
                    page = new Page('Home | MathBlog');
                    page.addBodyComponent(new Navbar());
                    page.addBodyComponent(new Posts());
                } else if (req.url === '/about.html') {
                    page = new Page('About | MathBlog');
                    page.addHeadComponent(new MathJax());
                    page.addBodyComponent(new Navbar());
                    page.addBodyComponent(new Text('This is a Math Blog.'));
                } else if (req.url.startsWith('/posts')) {
                        let db = await mongoClient.connect(DBURL);
                        let dbo = db.db(DBNAME);
                        let post = await dbo.collection('posts').findOne({path: req.url});
                        await db.close();
                        
                        // There should be a unique result since path is Primary Key
                        page = new Page(post.name+' | Mathblog');
                        page.addHeadComponent(new MathJax());
                        page.addBodyComponent(new Navbar());
                        page.addBodyComponent(new Text(post.latext));
                } else {
                    console.log('404!');
                        //TODO: return 404.html
                }
                res.end(await page.render());
            })()
        } else {
            fs.readFile(filePath, function (err, data) {
                if (err) {
                    // We are assuming that errors can only come from the user entering a
                    // non-existing path.
                    fs.readFile('./404.html', function(err, data) {
                        res.writeHead(404, { 'Content-Type': contentType });
                        res.end(err.message);
                    });
                } else {
                    res.writeHead(200, {'Content-Type': contentType});
                    res.end(data);
                }
            });
        }
    } catch (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(`Internal Server Error: ${err.message}`);
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

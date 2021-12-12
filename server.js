var fs   = require('fs');
var http = require('http');
var path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const extNameToContentType = {
    html: 'text/html',
    js:   'text/javascript',
    css:  'text/css',
    ico:  'image/x-icon',
    svg:  'image/svg+xml',
}

class Page {
    constructor(title){
        this.title = title;
        this.bodyComponents = [];
        this.headComponents = [];
    }
    render(){
        let html;
        html =  '<!DOCTYPE html>';
        html += '<html>';
        html += '<head>';
        html += "<meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
        html += `<title>${this.title}</title>`;
        for (const hc of this.headComponents) {
            html += hc.render();
        }
        html += '<link rel="stylesheet" href="css/style.css">';
        html += '</head>';
        html += '<body>';
        for (const bc of this.bodyComponents) {
            html += bc.render();
        }
        html += '</body></html>';
        return html;
    }
    addBodyComponent(c) { this.bodyComponents.push(c); }
    addHeadComponent(c) { this.headComponents.push(c); }
}

class Navbar {
    constructor() {}
    render() {
        let html = '<div class="navbar">\
            <div class="container">\
                <a class="logo" href="#">Math<span>Blog</span></a>\
                <img id=open-menu class="mobile-menu" src="images/menu.svg" alt="Open Navigation">\
                <nav>\
                    <img id=exit-menu class="mobile-menu-exit" src="images/exit.svg" alt="Close Navigation">\
                    <ul class="primary-nav">\
                        <li><a href="./index.html">Home</a></li>\
                        <li><a href="./about.html">About</a></li>\
                    </ul>\
                    <ul class="login-nav">\
                        <li><a href="#">Sign in</a></li>\
                        <li><a href="#">Sign up</a></li>\
                    </ul>\
                </nav>\
            </div>\
        </div>';
        return html;
    }
}

//TEMP
posts = [
    ['alekfr', '12-12-2021', 'Trigonometric Functions', String.raw`<p>The geometric definition of trig functions we learn in school are not rigourous since Euclidean Geometry (the results derived from Euclid's axioms) isn't trully just theorems from the axioms, it involves geometric intuition as well. Moreover, most of Modern Math is done inside the set theoretical framework of ZFC. Thus, even if we had learned geometry from Hilbert, which is rigorous, we would have to abandon it (the formal consequences; the intuition remains the same) when working with Analysis. Hence, the only viable alternative is to give abstract definitions for the trigonometric functions.</p><p>One example of such definition would be the power series representation of sine and cosine.</p>` + String.raw`$$\begin{align}\sin(x) &= \sum_{n=0}^\infty \frac{(-1)^n}{(2n+1)!}x^{2n+1} \\ \cos(x) &= \sum_{n=0}^\infty \frac{(-1)^n}{(2n)!}x^{2n}\end{align}$$`],
    ['smartfella', '12-13-2021', 'Euler\'s Number', null],
    ['fartsmella', '12-14-2021', 'Numeric Integrals', null],
]
class Posts {
    constructor(post_db) { this.post_db = post_db; }
    render() {
        let html;
        html  = '<section class="posts">';
        html += '<div class="container">';
        html += '<h1>Latest Posts</h1>';
        html += '<ul>';

        for (const p of posts) {
            html += `<li><a href="${p[1]}-${p[0]}-${p[2].replace(/\s/g,"-").toLowerCase()}.html" class="post-title">${p[2]}`;
            html += `<cite class="post-cite">${p[0]}</cite>`;
            html += '<img src="images/illustration.svg" class="post-image" alt="Illustration"></a></li>';
        }

        html += '</ul></div></section>';
        return html;
    }
}

class Text {
    constructor(text) { this.text = text; }
    render() {
        return this.text;
    }
}

class MathJax {
    constructor() {}
    render() {
        let html;
        html  = '<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>';
        html += '<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>';
        return html;
    }
}

// Register request event
const server = http.createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.html';

    const extName = path.extname(filePath).slice(1);
    const contentType = extNameToContentType[extName];

    // Dynamically build html from JS components
    if (extName == 'html') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        let page;
        switch (req.url) {
            case '/':
            case '/index.html':
                page = new Page('Home | MathBlog');
                page.addBodyComponent(new Navbar());
                page.addBodyComponent(new Posts());
                break;
            case '/about.html':
                page = new Page('About | MathBlog');
                page.addBodyComponent(new Navbar());
                page.addBodyComponent(new MathJax('This is a Math Blog.'));
                break;
            case '/12-12-2021-alekfr-trigonometric-functions.html':
                // Query database to find the post
                title = posts[0][2];
                page = new Page(title+' | MathBlog');
                page.addHeadComponent(new MathJax());
                page.addBodyComponent(new Navbar());
                page.addBodyComponent(new Text(posts[0][3]));
                break;
        }
        res.end(page.render());
    } else {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                //NOTE: We are assuming that errors can only come from the user entering a
                //      non-existing path.
                fs.readFile('./404.html', function(err, data) {
                    res.writeHead(404, { 'Content-Type': contentType });
                    res.end(err);
                });
            } else {
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            }
        });
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

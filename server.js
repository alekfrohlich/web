var fs   = require('fs');
var http = require('http');
var path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

class Page {
    constructor(title){ this.title = title; this.components = []; }
    render(){
        let html;
        html =  '<!DOCTYPE html>';
        html += '<html>';
        html += '<head>';
        html += "<meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
        html += `<title>${this.title}</title>`;
        html += '<link rel="stylesheet" href="css/style.css">';
        html += '</head>';
        html += '<body>';
        for (const c of this.components) {
            html += c.render();
        }
        html += '</body></html>';
        return html;
    }
    addComponent(c) {
        this.components.push(c);
    }
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
                        <li><a href="./test.html">Home</a></li>\
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

class Posts {
    constructor() {}
    render() {
        let html = '<section class="posts">\
            <div class="container">\
                <h1>\
                    Latest Posts\
                </h1>\
                <ul>\
                    <li>\
                        <a href="#" class="post-title">Fibonacci Sequence\
                        <cite class="post-cite">Alek</cite>\
                        <img src="images/illustration.svg" class="post-image" alt="Illustration">\
                        </a>\
                    </li>\
                    <li>\
                        <a href="#" class="post-title">Euler\'s Number\
                        <cite class="post-cite">Smart Fella</cite>\
                        <img href="#" src="images/illustration.svg" class="post-image" alt="Illustration">\
                        </a>\
                    </li>\
                    <li>\
                        <a href="#" class="post-title">Numeric Integrals\
                        <cite class="post-cite">Fart Smella</cite>\
                        <img src="images/illustration.svg" class="post-image" alt="Illustration">\
                        </a>\
                    </li>\
                </ul>\
            </div>\
        </section>';
        return html;
    }
}

// Register request event
const server = http.createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    var filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.html';

    // This just returns the file the user wanted
    var extName = path.extname(filePath);
    console.log(extName);
    var contentType = 'text/html';
    switch (extName) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
    }

    // Server Side Rendering
    if (extName == '.html') {
        res.writeHead(200, {'Content-Type': contentType});
        let homePage = new Page('Home | MathBlog');
        let navBar = new Navbar();
        let posts = new Posts();
        homePage.addComponent(navBar);
        homePage.addComponent(posts);
        res.end(homePage.render());
    } else {
        fs.readFile(filePath, function (err, data) {
            if (err) {
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

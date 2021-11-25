var fs   = require('fs');
var http = require('http');
var path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

// Register request event
const server = http.createServer(function (req, res) {
    console.log(`${req.method} ${req.url}`);

    var filePath = '.' + req.url;
    if (filePath == './')
        filePath = './index.html';

    // This just returns the file the user wanted
    var extName = path.extName(filePath);
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
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

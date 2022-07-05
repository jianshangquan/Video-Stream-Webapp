const express = require('express');
const path = require('path');
const fs = require('fs');
const {engine} = require('express-handlebars');
const https = require('https')
const utils = require('./utils');

const app = express();



app.use(express.static(path.join('./html/')));
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './view');


app.get('/', (req, res) => {
    // res.sendFile(path.join('./html/index.html'));
    const folders = utils.getDirectories(path.join('./videos'));
    console.log(folders)
    res.render('index', {folders});
})

app.get('/:videoFolder', (req, res) => {
    const {videoFolder} = req.params;
    const folder = path.join( './', 'videos', decodeURIComponent(videoFolder));
    const files = utils.getFiles(folder);
    console.log(files);
    res.render('video', {files, videoFolder})
})


app.get('/stream/*', (req, res) => {
    // console.log(req.url);
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = path.join(__dirname, '../', '/videos', decodeURIComponent(req.url.replace('/stream/', '')));
    const videoSize = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
})


// app.listen(8880, (e) => {
//     console.log('Server start listen on port 8880')
// })


const privateKey = fs.readFileSync(path.join(__dirname, '../', 'ssl', 'private.pem'));
const certificate = fs.readFileSync(path.join(__dirname, '../', 'ssl', 'certificate.pem'));
https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(2096)
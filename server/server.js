const express = require('express');
const https = require('https');
const path = require('path');
const fs = require('fs');

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const app = express();
app.use(express.static(path.join(__dirname, '../static')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../static'));
});

const server = https.createServer(options, app);
const port = 443;
server.listen(port);
server.on('listening', () => {
    console.log('Server listening on https://localhost:' + port + ' .');
});

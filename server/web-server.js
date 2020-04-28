const express = require('express')
const cors = require('cors')
const srt2vtt = require('srt-to-vtt');
const fs = require('fs');
const app = express()
const {
  address,
  port
} = require('./os-info');

app.use(cors())

app.get('/subs/:fileName', (req, res, next) => {
  fs.createReadStream(req.params.fileName)
    .pipe(srt2vtt())
    .pipe(res);
});

app.get('/videos/:fileName', (req, res, next) =>
  fs.createReadStream(req.params.fileName).pipe(res)
);

app.get('/ping', (req, res, next) => {
  res.send('pong');
  res.end();
});

app.listen(port, address, () => console.log(`listening on port ${port}`));
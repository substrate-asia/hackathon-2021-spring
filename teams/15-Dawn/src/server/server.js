const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mock = require('./mock');
const axios = require('axios')
const https = require('https');
const qs = require('querystring');

dotenv.config();
const app = express();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const TIMEOUT = 500;

app.use(express.static(path.join(__dirname, '../build'), { index: false }));

app.get('/ping', (req, res) => res.send('pong'));

app.post('/api/client_credentials', (req, res) => {
  const client_id = 'iVq8QFW8oMEs5nUFe2QfmCiQ';
  const client_secret = 'HGo3dtAiF99b8QHRfDNHmYOCZz8Y3Gce';
  axios.get(`http://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`)
    .then(async function (response) {
      const result = await selfie_anime(response.data, req.body, res)
      res.send(JSON.stringify(result.data))
    })
    .catch(function (error) {
      console.log(error);
    });
});


async function selfie_anime(data, body, res) {
  const access_token = data.access_token;
  const img = body.image;
  return await axios({
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify({
      image: img,
      type: 'anime',
    }),   // 用 qs 将js对象转换为字符串 'name=edward&age=25'
    url: `https://aip.baidubce.com/rest/2.0/image-process/v1/selfie_anime?access_token=${access_token}`
  })
}


// Get nfts info
app.get('/nft-api/nfts', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, TIMEOUT));
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(mock.nfts));
});

// Get single nft info
app.get('/nft-api/nft/:id', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, TIMEOUT));
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(mock.nft));
});

// Get user info
app.get('/nft-api/user/:id', async (req, res) => {
  await new Promise(resolve => setTimeout(resolve, TIMEOUT));
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(mock.user));
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(process.env.PORT || 8181);
const express = require('express');
const {createProxyMiddleware, responseInterceptor} = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth');

const appPort = parseInt(process.env.VIRTUAL_PORT);

const virtualHost = process.env.VIRTUAL_HOST;
const tunnelHost = process.env.TUNNEL_HOST;
const tunnelPort = process.env.TUNNEL_PORT;
const targetHost = process.env.TARGET_HOST;

console.log('APP PORT:', appPort);
console.log('VIRTUAL HOST:', virtualHost);
console.log('TUNNEL HOST:', tunnelHost);
console.log('TARGET HOST:', targetHost);

const auth = {
    admin: 'adminpass'
};

const proxyOptions = {
    target: `http://${tunnelHost}`,
    changeOrigin: true,
    secure: false,
    rejectUnauthorized: false,
    selfHandleResponse: true,

    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // replace location header
        proxyRes.headers.location ? res.setHeader('location', proxyRes.headers.location.replace(new RegExp(`/\/${targetHost}/`, 'g'), `//${virtualHost}/`)) : false;

        // rewrite response html plain and json
        let response = responseBuffer.toString('utf8');
        const matchHtml = new RegExp(/text/);
        const matchJson = new RegExp(/json/);
        if (matchHtml.test(proxyRes.headers['content-type']) || matchJson.test(proxyRes.headers['content-type'])) {
            // replace protocol
            response = response.replace(new RegExp(/http:/, 'g'), 'https:');
            // replace host
            response = response.replace(new RegExp(`${targetHost}`, 'g'), `${virtualHost}`);
            return response;
        } else {
            return responseBuffer;
        }
    }),

    onProxyReq: (proxyReq, req, res, options) => {
        ['Origin', 'Referer', 'Host'].forEach(i => {
            proxyReq.headers[i] ? proxyReq.setHeader(i, proxyReq.headers[i].replace(new RegExp(`${virtualHost}`, 'g'), `${targetHost}`).replace(new RegExp(/https:/, 'g'), 'http:')) : false;
        });
    }
};

const proxy = createProxyMiddleware(proxyOptions);
const app = express();

app.use(basicAuth({
    users: auth,
    challenge: true
}));

app.use('/', proxy);
module.exports = app.listen(appPort);
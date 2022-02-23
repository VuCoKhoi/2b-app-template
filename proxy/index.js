const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const configProxy = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
    cookieDomainRewrite: "localhost",
  },
  "/": {
    target: "http://localhost:3000",
    // changeOrigin: true,
    cookieDomainRewrite: "localhost",
    ws: true,
  },
};

const server = express();

Object.keys(configProxy).forEach(function (context) {
  server.use(createProxyMiddleware(context, configProxy[context]));
});

const PORT = 3555;

server.listen(PORT, () => {
  console.log("Server proxy running on port", PORT);
});

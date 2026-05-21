const fs = require("fs");
const http = require("http");
const path = require("path");

const root = process.cwd();
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

http.createServer((req, res) => {
  let pathname = new URL(req.url, "http://localhost").pathname;
  if (pathname === "/") pathname = "/index.html";

  const file = path.normalize(path.join(root, pathname));
  if (!file.startsWith(root)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  fs.createReadStream(file)
    .on("error", () => {
      res.statusCode = 404;
      res.end();
    })
    .on("open", () => {
      res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    })
    .pipe(res);
}).listen(8000, "127.0.0.1");

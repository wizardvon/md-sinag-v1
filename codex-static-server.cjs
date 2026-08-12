const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(process.cwd());
const host = process.env.HOST || "127.0.0.1";
const defaultPort = 8000;
const portFlagIndex = process.argv.findIndex((argument) => argument === "--port" || argument === "-p");
const requestedPort = Number(
  portFlagIndex >= 0 ? process.argv[portFlagIndex + 1] : process.env.PORT || defaultPort
);
const port = Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort <= 65535
  ? requestedPort
  : defaultPort;
const browserHost = ["127.0.0.1", "0.0.0.0", "::"].includes(host) ? "localhost" : host;
const appUrl = `http://${browserHost}:${port}/`;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${host}`).pathname);
  } catch (error) {
    res.statusCode = 400;
    res.end("Bad request");
    return;
  }
  if (pathname === "/") pathname = "/index.html";

  const file = path.resolve(root, `.${pathname}`);
  const relativePath = path.relative(root, file);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    res.statusCode = 403;
    res.end("Forbidden");
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
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    checkForRunningSinagApp(port).then((isSinagRunning) => {
      if (isSinagRunning) {
        console.log(`SINAG is already running at ${appUrl}`);
        console.log("Open that URL in your browser. Use Ctrl+C in its original terminal to stop it.");
        return;
      }

      console.error(`Port ${port} is already being used by another application.`);
      console.error("Stop that application or choose another port, for example:");
      console.error("npm run dev -- --port 8001");
      process.exitCode = 1;
    });
    return;
  }

  console.error(`Unable to start the SINAG development server: ${error.message}`);
  process.exitCode = 1;
});

server.on("listening", () => {
  console.log(`SINAG development server: ${appUrl}`);
  console.log("Press Ctrl+C to stop.");
});

function checkForRunningSinagApp(occupiedPort) {
  const expectedIndex = fs.readFileSync(path.join(root, "index.html"), "utf8");

  return new Promise((resolve) => {
    const request = http.get(
      { host, port: occupiedPort, path: "/index.html", timeout: 1500 },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          resolve(false);
          return;
        }

        response.setEncoding("utf8");
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
          if (body.length > expectedIndex.length) response.destroy();
        });
        response.on("end", () => resolve(body === expectedIndex));
        response.on("error", () => resolve(false));
      }
    );

    request.on("timeout", () => request.destroy());
    request.on("error", () => resolve(false));
  });
}

server.listen(port, host);

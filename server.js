let http = require("http");
let util = require("util");
let fs = require("fs");

http.createServer(function (req, res) {
  let acceptHeader = req.headers.accept.toLowerCase();
  let url = req.url.toLowerCase();

  if (url === "/eventos" && acceptHeader === "text/event-stream") {
    handleSSE(res);
  } else if (url === "/index.html" || url === "/") {
    handleStatico(res, "index.html");
  } else {
    notFound(res);
  }

}).listen(8083);

let notFound = function (res) {
  res.writeHead(404);
  res.end();
};

let timerId;
let count = 0;

let scheduleEvent = function (res) {
  timerId = setTimeout(function () {
    try {
      emitRandomEvent(res);
      scheduleEvent(res);
    } catch (e) {
      console.log("ERROR: " + e.message);
    }
  }, 5000);
};

let handleSSE = function (res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });

  res.on("close", function () {
    clearTimeout(timerId);
  });

  scheduleEvent(res);
};

let id = 0;

let emitRandomEvent = function (res) {
  let eventMsg = Math.random() < 0.5,
    data = (new Date()).toISOString();
  id = id +1;
  res.write("id: " + id + "\n");
  if (eventMsg) {
    res.write("event: evento\n");
  }
  res.write("data: " + data + "\n\n");
};

let handleStatico = function (res, fileName) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(fs.readFileSync(fileName));
  res.end();
};
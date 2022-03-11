// This is the server file which will enable the running of the server

// import {createServer} from "http";
// import app from "./app.js";

// const port = process.env.port || 4000;

// const server = createServer(app);
// console.log(port)

// server.listen(port);

const http = require("http");
const app = require("./app");

const port = process.env.port || 4000;

const server = http.createServer(app.app);
console.log(port)

server.listen(port);
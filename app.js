const express = require('express');
const bodyParser = require("body-parser");
const app = express();
require('dotenv').config();
require('./models/index');
const router = require('./router/index');
const morgan = require('morgan');


// const Mind = require('./Mind');
// const mind = new Mind('./test.json');

// let input = 'movies';

// console.log(`${mind.think(input)}`); 

const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
// app.engine('ejs', ejs.renderFile);
app.use(require('cors')());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ limit: "50mb" }));
app.use("/", router);
app.listen(PORT, (() => console.log("server is connected on " + PORT)));
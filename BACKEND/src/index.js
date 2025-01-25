require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const con_string = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@bda.atgx7.mongodb.net/?retryWrites=true&w=majority&appName=BDA`
mongoose.connect(con_string);

const websitesRouter = require('./routes/websites');
const websiteRouter = require('./routes/website');
const initRouter = require('./routes/init');

app.use(express.json());
app.use('/api/websites', websitesRouter);
app.use('/api/website', websiteRouter);
app.use('/api/init', initRouter);

app.get('/', (req, res) => {
    res.send('Welcome to webmaster!');
});


app.listen(3032);

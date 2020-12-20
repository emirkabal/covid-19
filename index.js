require('dotenv').config();
const cron = require('node-cron');
const fetch = require('node-fetch').default;
const express = require('express');
const path = require('path');

var app = express();
var covidData = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/data.json', async (req, res) => {
    res.json(covidData);
});

const update = async () => {
    const data = await fetch('https://covid19.saglik.gov.tr/')
        .then((res) => res.text()).catch(() => null);
    //
    if (!data) return;
    try {
        const jsonData = JSON.parse(data.split('var sondurumjson =')[1].split(';//')[0].trim());
        covidData = jsonData[0];
    } catch (error) {
        console.error(error);
    }
} 

update();
cron.schedule('0,5,10,15,30,35,45 19,20,21 * * *', async () => {
    update();
}, {
  scheduled: true,
  timezone: "Europe/Istanbul"
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`❤ Application started on ${process.env.PORT || 3000}`);
});
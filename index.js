require('dotenv').config();
const cron = require('node-cron');
const fetch = require('node-fetch').default;
const express = require('express');
const path = require('path');

var app = express();
var covidData = {};
var covidDatabutHistorical = [];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/data.json', (req, res) => {
    res.json(req.query.new && covidData[0] ? covidData[0] : covidData);
});

app.get('/historical.json', (req,res) => {
    res.json(covidDatabutHistorical);
});

const getHtml = async (url) => {
    return (await fetch(url)
        .then((res) => res.text()).catch(() => null));
}
const jsonParser = (html, type="sondurumjson") => {
    let jsonData;
    try {
        jsonData = JSON.parse(html.split(`var ${type} =`)[1].split(';//')[0].trim());
    } catch (error) {
        console.error(error);
    }
    return jsonData;
} 

const update = async () => {
    (async () => {
        const data = await getHtml('https://covid19.saglik.gov.tr/');
        if (!data) return;
        const json = jsonParser(data);
        if (json) covidData = json;
    })();
    (async () => {
        const data = await getHtml('https://covid19.saglik.gov.tr/TR-66935/genel-koronavirus-tablosu.html');
        if (!data) return;
        const json = jsonParser(data, 'geneldurumjson');
        if (json) covidDatabutHistorical = json;
    })();
} 

update();
cron.schedule('*/1 * * * *', async () => {
    update();
}, {
  scheduled: true,
  timezone: "Europe/Istanbul"
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`❤ Application started on ${process.env.PORT || 3000}`);
});
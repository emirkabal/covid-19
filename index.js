const cron = require('node-cron');
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
var app = express();


app.get('/', (req, res) => {
    res.status(200).json({
        status: "OK"
    });
});


app.get('/file/:file', async (req, res) => {

    let file = req.params.file;
    let images = fs.readdirSync('./images');

    if (!file || !images.includes(file.toLocaleLowerCase())) {
        return res.json({
            status: "error"
        });
    }


    let image = Buffer.from(fs.readFileSync('./images/'+file), 'base64');

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
    });

    res.end(image);

})

app.listen(3000, () => {
    console.log('web application started on 3000 port.');
});


const update = async () => {

    if (!fs.existsSync('./images')) {
        console.log('created images folder.');
        fs.mkdirSync('./images');
    }
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto('https://covid19.saglik.gov.tr/', { waitUntil: 'networkidle2' });
    
    let date = new Date();
    let dateStr = `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

    await page.screenshot({
        path: `./images/info-table.png`,
        clip: {x: 43, y: 232, width: 894, height: 480}
    });
    console.log('saved info table');

    await page.screenshot({
        path: `./images/statistics-table.png`,
        clip: {x: 983, y: 232, width: 894, height: 497}
    });

    console.log('saved statistics table');


    browser.close();

} 


update();
cron.schedule('0,5,10,15,30,35,45 19,20,21 * * *', async () => {
  
    update();


}, {

  scheduled: true,
  timezone: "Europe/Istanbul"

});


function pad(num) {
    if (num < 10) return `0${num}`;
    else return num;
}



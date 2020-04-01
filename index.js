const cron = require('node-cron');
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
var app = express();

if (!fs.existsSync('./images')) {
    console.log('created images folder.');
    fs.mkdirSync('./images');
}


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
    
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    
    await page.goto('https://covid19.saglik.gov.tr/', { waitUntil: 'networkidle2' });
    
    await page.screenshot({
        path: './images/info-table.png',
        clip: {x: 43, y: 232, width: 894, height: 498}
    });
    console.log('saved info table');

    await page.screenshot({
        path: './images/statistics-table.png',
        clip: {x: 983, y: 232, width: 894, height: 497}
    });

    console.log('saved statistics table');


    browser.close();

} 


update();
cron.schedule('0 20 * * *', async () => {
  
    update();


}, {

  scheduled: true,
  timezone: "Europe/Istanbul"

});




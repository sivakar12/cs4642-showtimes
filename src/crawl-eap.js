const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath: '/usr/bin/google-chrome',
        // headless: false
    })
    const page = await browser.newPage()
    await page.goto('https://www.eapmovies.com/component/eapmovies/?controller=ratesandshowtime')

    // const theatre_list_select = await page.$('#filter_theater')
    list = await page.$$eval('#filter_theater option', nodes => nodes.map(node => node.innerText))
    // names = await list.$eval()
    console.log(list)
    await browser.close()
})()

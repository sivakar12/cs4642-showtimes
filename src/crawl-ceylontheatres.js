const puppeteer = require('puppeteer');

(async function() {
    let browser
    try {
        browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
            headless: true
        })
        const page = await browser.newPage()
        await page.goto('https://www.ceylontheatres.lk')
    
        const more_info_buttons = await page.$$eval('.moreinfobtn', buttons => buttons.map(b => b.innerText))
        console.log(more_info_buttons)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()
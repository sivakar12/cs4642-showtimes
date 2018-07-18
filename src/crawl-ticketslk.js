const puppeteer = require('puppeteer');

async function isNextButtonActive(page) {
    nextButton = await page.$('#nextBtn')
    return await nextButton.eval('a', a => a.disabled)
}
(async function() {
    let browser
    try {
        browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
            headless: false
        })
        const page = await browser.newPage()
        await page.goto('http://www.ticketslk.com')

        const nextButton = page.$('#nextBtn')
        const theatreNames = await page.$$eval('.theater_title', theatres => 
            theatres.map(t => t.innerText))
        
        console.log(theatreNames)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()
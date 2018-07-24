const puppeteer = require('puppeteer');

async function isNextButtonActive(page) {
    let nextButton = await page.$('#nextBtn')
    let property = await nextButton.$eval('a', anchor => anchor.getAttribute('class'))
    return property != 'disabled'
}

async function getThreatreNames(page) {
    const theatreNames = await page.$$eval('.theater_title', theatres => 
        theatres.map(t => t.innerText))
    return theatreNames
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

        
        let theaterDetails = []
        theaterDetails = await getThreatreNames(page)
        while (await isNextButtonActive(page)) {
            nextButton = await page.$('#nextBtn a')
            await page.waitFor(2000)
            await nextButton.click()
            theaterDetails = theaterDetails.concat(await getThreatreNames(page))
        }
        await page.waitFor(5000)
        console.log(theaterDetails)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()
const puppeteer = require('puppeteer');

async function isNextButtonActive(page) {
    let nextButton = await page.$('#nextBtn')
    let property = await nextButton.$eval('a', anchor => anchor.getAttribute('class'))
    return property != 'disabled'
}

async function getTheaterDetails(page) {
    const movies = await page.$$('.homeMovie')
    let tip = await movies[1].$('.quick_info_tooltip')
    await tip.hover()
    theatres = await Promise.all(movies.map(async movie => {
        const theater = await movie.$eval('.theater_title', t => t.innerText)
        const desc = await movie.$eval('.tooltip_description', t => t.innerText)
        const titleRaw = await movie.$eval('.tooltip_description', t => t.title)
        const timeRegex = /\d\d\.\d\d[A|P]M/g
        const times = desc.match(timeRegex)
        const title = titleRaw.match(/.*>(.+)\s<.*/)[1]
        return { theater: theater, times, title }
    }))

    return theatres
}
        
(async function() {
    let browser
    try {
        browser = await puppeteer.launch({
            executablePath: "/usr/bin/google-chrome",
            headless: false
        })
        const page = await browser.newPage()
        await page.goto('http://www.ticketslk.com', {
            timeout: 3000000
        })

        
        let theaterDetails = []
        theaterDetails = await getTheaterDetails(page)
        while (await isNextButtonActive(page)) {
            nextButton = await page.$('#nextBtn a')
            await page.waitFor(2000)
            await nextButton.click()
            theaterDetails = theaterDetails.concat(await getTheaterDetails(page))
        }
        await page.waitFor(5000)
        console.log(theaterDetails)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()
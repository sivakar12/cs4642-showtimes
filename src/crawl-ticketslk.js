const puppeteer = require('puppeteer');
const moment = require('moment');
const _ = require('lodash');
const writeJson = require('write-json');

async function isNextButtonActive(page) {
    let nextButton = await page.$('#nextBtn')
    let property = await nextButton.$eval('a', anchor => anchor.getAttribute('class'))
    return property != 'disabled'
}

function mapTime(timeString) {
    let date = moment().format('YYYY-MM-DD') + ' ' + timeString 
    // date = moment(date)
    date = moment(date, 'YYYY-MM-DD hh.mmA')
    return date.format()
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
        const pricesRegex = /\d{3,4}/g
        const prices = desc.match(pricesRegex)
        return { theater: theater, times: times.map(mapTime), movie: title, prices }
    }))

    return theatres
}
    
function splitByTime(record) {
    const common = _.omit(record, 'times')
    return record.times.map(time => _.assign({}, {time: time}, common))
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
        // console.log(theaterDetails)

        const finalData = _.flatten(theaterDetails.map(splitByTime))
        // console.log(finalData)
        console.log(finalData.length + ' records collected!')
        await writeJson('data/ticketslk.json', finalData)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()
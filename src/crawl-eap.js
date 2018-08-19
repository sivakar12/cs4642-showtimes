const puppeteer = require('puppeteer')
const moment = require('moment')
const writeJson = require('write-json')

function getNextDays(n) {
    const dates = []
    for (let i = 0; i < n; i++) {
        let date = moment().add(i, 'days').format('YYYY-MM-DD')
        dates.push(date)
    }
    return dates
}
async function getTheatreList(page) {
    // const theatre_list_select = await page.$('#filter_theater')
    const names = await page.$$eval('#filter_theater option', nodes => nodes.map(node => ({
        theaterName: node.innerText,
        index: node.getAttribute('value')
    })))
    return names
}

async function getShowtimesList(page) {
    const showtimesList = await page.$$eval('#filter_showtime option', nodes => nodes.map(node => ({
        showTime: node.innerText,
        index: node.getAttribute('value')
    })))
    return showtimesList
}

(async () => {
    let browser
    try {
        browser = await puppeteer.launch({ 
            executablePath: '/usr/bin/google-chrome',
            headless: false
        })
        const page = await browser.newPage()
        await page.goto('https://www.eapmovies.com/component/eapmovies/?controller=ratesandshowtime')
        
        data = []

        const dates = getNextDays(3)
        for (date of dates) {
            // let dateField = await page.$('#filter_date')
            await page.evaluate((date) => {
                document.querySelector('#filter_date').value = date
            }, date)
            await page.waitFor(1000)
            const theaters = await getTheatreList(page)
            for (theater of theaters) {
                if (theater.theaterName == 'Select Theater') continue
                await page.select('#filter_theater', theater.index)
                await page.waitFor(1000)
                const showTimes = await getShowtimesList(page)
                for (showTime of showTimes) {
                    if (showTime.showTime == 'Select Show Time') continue
                    await page.select('#filter_showtime', showTime.index)
                    await page.waitForFunction("document.getElementById('movie').value.length > 0")
                    const movie = await page.$eval('#movie', i => i.value)
                        data.push({
                            movie,
                            showTime: showTime.showTime,
                            theater: theater.theaterName,
                            date
                        })
                        console.log(data.length + ' items collected')
                }
            }
        }
        await page.waitFor(5000)
        console.log(data)
        writeJson('data/eap.json', data)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()

const puppeteer = require('puppeteer');

async function getTheatreList(page) {
    const theatre_list_select = await page.$('#filter_theater')
    list = await page.$$eval('#filter_theater option', nodes => nodes.map(node => node.innerText))
    return list
}

async function openCalendar(page) {
    const calendar_button = await page.$('span.input-group-addon')
    await calendar_button.click()

    await page.waitForSelector('.table-condensed')
}

async function getToday(page) {
    await openCalendar(page)
    today = await page.$eval('.today.day', node => node.innerText)
    return today
}

async function getDatesOnCalendar(page) {
    await openCalendar(page)
    const dates = await page.$$eval('.day', nodes => nodes.map(node => node.innerText))
    return dates
}

async function clickDateOnCalendar(page, date) {
    await openCalendar(page)
    const dateElement = await page.$$eval('.day', nodes => nodes.filter(node => node.innerText == 7))
    console.log(dateElement)
    await dateElement[0].click()
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
    
        // await console.log(await getDatesOnCalendar(page))
        await clickDateOnCalendar(page, 25)
    } catch (e) {
        console.error(e)
    } finally {
        await browser.close()
    }
})()

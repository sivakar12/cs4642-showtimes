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

(async () => {
    const browser = await puppeteer.launch({ 
        executablePath: '/usr/bin/google-chrome',
        headless: true
    })
    const page = await browser.newPage()
    await page.goto('https://www.eapmovies.com/component/eapmovies/?controller=ratesandshowtime')

    await console.log(await getDatesOnCalendar(page))

    await browser.close()
})()

const Puppeteer = require('puppeteer')

class GetDOM {
  static async getDOM (url) {
    const browser = await Puppeteer.launch()
    try {
      const page = await browser.newPage()
      await page.goto(url)
      return await page.content()
    } catch (err) {
      console.error(err)
    } finally {
      await browser.close()
    }
  }
}

module.exports = GetDOM

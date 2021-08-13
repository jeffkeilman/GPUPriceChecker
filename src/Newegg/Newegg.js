const jsdom = require('jsdom')
const { JSDOM } = jsdom

const PuppeteerWrapper = require('../PuppeteerWrapper/PuppeteerWrapper')

const {
  neweggSearchURL,
  neweggPageParam,
  neweggItemContainer,
  neweggUrlSpaceChar,
  neweggPriceClass,
  neweggCentsPriceSelector,
  neweggDollarsPriceSelector,
  neweggGraphicsCardFilterId,
  neweggFilterParam,
  neweggPaginationClass,
  neweggPageSelector,
  neweggPaginationTextPrefix,
  neweggItemTitleClass,
  neweggSpaceCharN,
  neweggInStockFilterId,
  pageText,
  neweggSearchTermFilterParam
} = require('../../constants/constants')

class Newegg {
  constructor (gpuName) {
    this.gpuName = gpuName
  }

  getGPUName () {
    return this.gpuName
  }

  getBaseLink () {
    // ex. https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709
    return neweggSearchURL + neweggSearchTermFilterParam + this.gpuName.split(' ').join(neweggUrlSpaceChar) + '&' +
      neweggFilterParam + neweggGraphicsCardFilterId + neweggSpaceCharN + neweggInStockFilterId
  }

  getPageLink (page) {
    return this.getBaseLink() + '&' + neweggPageParam + String(page)
  }

  getNumberOfPages (pageHTML) {
    const dom = new JSDOM(pageHTML)
    const paginationTextEl = dom.window.document.getElementsByClassName(neweggPaginationClass)[0]
    // ex. 1<!-- -->/<!-- -->10
    const paginationText = paginationTextEl.querySelector(neweggPageSelector).innerHTML
    return Number(paginationText.replace(neweggPaginationTextPrefix, ''))
  }

  getCheapestProductSinglePage (pageHTML) {
    const cheapestItem = {
      price: Infinity,
      link: null
    }
    const dom = new JSDOM(pageHTML)
    const items = dom.window.document.getElementsByClassName(neweggItemContainer)
    for (const item of items) {
      const description = item.getElementsByClassName(neweggItemTitleClass)[0]
      const priceEl = item.getElementsByClassName(neweggPriceClass)[0]
      if (
        !priceEl ||
        !description ||
        !description.innerHTML ||
        !description.innerHTML.toLowerCase().includes(this.getGPUName().toLowerCase())
      ) {
        continue
      }
      const priceDollars = priceEl.querySelector(neweggDollarsPriceSelector)
      const priceCents = priceEl.querySelector(neweggCentsPriceSelector)

      if (priceDollars && priceCents) {
        const price = Number(priceDollars.innerHTML.replace(',', '') + priceCents.innerHTML)
        if (cheapestItem.price > price) {
          cheapestItem.price = price
          cheapestItem.link = item.querySelector('a').href
        }
      }
    }

    return cheapestItem
  }

  async getCheapestProductAllPages () {
    const puppeteer = new PuppeteerWrapper()
    await puppeteer.init()

    const firstPageHTML = await puppeteer.getDOM({ url: this.getBaseLink(), name: this.getGPUName + pageText + '1' })
    const numPages = this.getNumberOfPages(firstPageHTML)

    const links = []
    for (let x = 2; x <= numPages; x++) {
      const pageLink = this.getPageLink(x)
      links.push({
        url: pageLink,
        name: this.gpuName + pageText + pageLink.slice(-1)
      })
    }
    const allPagesHTML = await puppeteer.getDOM(links)
    allPagesHTML.unshift(firstPageHTML)

    const cheapestCard = {
      price: Infinity,
      link: null,
      name: null
    }
    allPagesHTML.forEach(html => {
      const cheapestOnPage = this.getCheapestProductSinglePage(html)
      if (cheapestOnPage.price < cheapestCard.price) {
        cheapestCard.price = cheapestOnPage.price
        cheapestCard.link = cheapestOnPage.link
        cheapestCard.name = this.gpuName
      }
    })

    puppeteer.teardown()
    return cheapestCard
  }
}

module.exports = Newegg

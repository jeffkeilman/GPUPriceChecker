const jsdom = require('jsdom')
const { JSDOM } = jsdom

const GetDOM = require('../PuppeteerWrapper/PuppeteerWrapper')

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
  neweggInStockFilterId
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
    return neweggSearchURL + this.gpuName.split(' ').join(neweggUrlSpaceChar) + '&' +
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
    const cheapestCard = {
      price: Infinity,
      link: null
    }

    const firstPageHTML = await GetDOM.getDOM(this.getBaseLink())
    const numPages = this.getNumberOfPages(firstPageHTML)

    for (let x = 1; x <= numPages; x++) {
      const pageHTML = x === 1 ? firstPageHTML : await GetDOM.getDOM(this.getPageLink(x))
      const cheapestOnPage = this.getCheapestProductSinglePage(pageHTML)
      if (cheapestOnPage.price < cheapestCard.price) {
        cheapestCard.price = cheapestOnPage.price
        cheapestCard.link = cheapestOnPage.link
      }
    }

    return cheapestCard
  }
}

module.exports = Newegg

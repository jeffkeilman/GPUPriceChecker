const jsdom = require('jsdom')
const { JSDOM } = jsdom

const {
  neweggSearchURL,
  neweggPageParam,
  neweggItemContainer,
  neweggUrlSpaceChar,
  neweggPriceClass,
  neweggCentsPriceSelector,
  neweggDollarsPriceSelector,
  neweggGraphicsCardFilterId,
  neweggGraphicsCardFilterParam
} = require('../../constants/constants')

class Newegg {
  constructor (gpuName) {
    this.gpuName = gpuName
  }

  getBaseLink () {
    // ex. https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709
    return neweggSearchURL + this.gpuName.split(' ').join(neweggUrlSpaceChar) + '&' +
      neweggGraphicsCardFilterParam + neweggGraphicsCardFilterId
  }

  getPageLink (page) {
    return this.getBaseLink() + '&' + neweggPageParam + String(page)
  }

  getCheapestProductSinglePage (pageHTML) {
    const cheapestItem = {
      price: Infinity,
      link: null
    }
    const dom = new JSDOM(pageHTML)
    const items = dom.window.document.getElementsByClassName(neweggItemContainer)
    for (const item of items) {
      const priceEl = item.getElementsByClassName(neweggPriceClass)[0]
      if (!priceEl) {
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
}

module.exports = Newegg

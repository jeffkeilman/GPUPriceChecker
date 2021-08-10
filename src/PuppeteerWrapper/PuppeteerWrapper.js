const Puppeteer = require('puppeteer')

class PuppeteerWrapper {
  async init () {
    this.pages = []
    this.browser = await Puppeteer.launch()
  }

  getPages () {
    return this.pages
  }

  getPageCount () {
    return this.pages.length
  }

  getPageById (id) {
    return this.pages.find(page => page.id === id)
  }

  getPageByName (name) {
    return this.pages.find(page => page.pageName === name)
  }

  async closePages () {
    for (const pageObj in this.pages) {
      await pageObj.page.close()
    }
    this.pages = []
  }

  async teardown () {
    await this.closePages()
    await this.browser.close()
  }

  openPages (num) {
    const pageDataPromises = []
    for (let x = 1; x <= num; x++) {
      pageDataPromises.push(new Promise((resolve, reject) => {
        try {
          this.browser.newPage().then(page => {
            resolve({
              id: x,
              pageName: null,
              page: page
            })
          })
        } catch (err) {
          reject(err)
        }
      }))
    }

    return Promise.all(pageDataPromises).then(values => {
      this.pages = this.pages.concat(values)
    })
  }

  async getDOM (urls) {
    // urls: [{ url: 'https://newegg....', name: 'GTX 1660 Super' }] || { url: 'https://newegg...', name: 'GTX 1660 Super' }
    const isObject = typeof (urls) === 'object'
    const isArray = Array.isArray(urls)
    if (isObject && !isArray) {
      if (this.pages.length < 1) {
        await this.openPages(1)
      }
      const curPage = this.pages[0]
      curPage.pageName = urls.name
      await curPage.page.goto(urls.url)
      return await curPage.page.content()
    } else if (isObject && isArray) {
      if (urls.length < 1) {
        const errorMessage = 'Passed a url array with no urls'
        console.error(errorMessage)
        throw errorMessage
      }
      const pagesNeeded = urls.length - this.pages.length
      if (pagesNeeded > 0) {
        await this.openPages(pagesNeeded)
      }

      const pageNavPromiseList = []
      urls.forEach((url, index) => {
        this.pages[index].pageName = url.name
        pageNavPromiseList.push(this.pages[index].page.goto(url.url))
      })
      await Promise.all(pageNavPromiseList)

      const pageContentPromiseList = []
      for (let x = 0; x < urls.length; x++) {
        // only get content for pages we just navigated to
        pageContentPromiseList.push(this.pages[x].page.content())
      }
      return await Promise.all(pageContentPromiseList)
    } else {
      const errorMessage = 'Passed an improper argument instead of an array of URL objects, or single URL object'
      console.error(errorMessage)
      throw errorMessage
    }
  }
}

module.exports = PuppeteerWrapper
class Newegg {
  constructor (gpuName) {
    this.gpuName = gpuName
  }

  getBaseLink () {
    return 'https://www.newegg.com/p/pl?d=' + this.gpuName.split(' ').join('+')
  }

  getPageLink (page) {
    return this.getBaseLink() + '&page=' + String(page)
  }
}

module.exports = Newegg

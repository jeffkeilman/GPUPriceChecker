// const Newegg = require('./Newegg/Newegg')

// const newegg = new Newegg('GTX 1660 Super')

// newegg.getCheapestProductAllPages().then(console.log)

// const fs = require('./FileSystem/FileSystem')

// console.log(fs.getGraphicsCardList('GPUList/GPUList.txt'))

const PuppeteerWrapper = require('./PuppeteerWrapper/PuppeteerWrapper')

const testFn = async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()

  const doms = await newPuppeteer.getDOM({
    url: 'https://google.com',
    name: 'testdummy'
  })
  console.log('Num pages:', newPuppeteer.getPageCount())
  console.log(doms)
  console.log('\n\n\n\n')

  const doms2 = await newPuppeteer.getDOM([
    {
      url: 'https://google.com/',
      name: 'testdummy'
    }, {
      url: 'https://github.com/',
      name: 'testdummy'
    }, {
      url: 'https://stackoverflow.com/',
      name: 'testdummy'
    }
  ])
  console.log('Num pages:', newPuppeteer.getPageCount())
  console.log(doms2)
  console.log('\n\n\n\n')

  const doms3 = await newPuppeteer.getDOM([
    {
      url: 'https://girlandthegoat.com/',
      name: 'testdummy'
    },
    {
      url: 'https://yelp.com/',
      name: 'testdummy'
    }
  ])
  console.log('Num pages:', newPuppeteer.getPageCount())
  console.log(doms3)
}

if (require.main === module) {
  testFn()
}

// const Newegg = require('./Newegg/Newegg')

// const newegg = new Newegg('GTX 1660 Super')

// newegg.getCheapestProductAllPages().then(console.log)

// const fs = require('./FileSystem/FileSystem')

// console.log(fs.getGraphicsCardList('GPUList/GPUList.txt'))

const PuppeteerWrapper = require('./PuppeteerWrapper/PuppeteerWrapper')

const testFn = async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()

  const doms = await newPuppeteer.getDOM([{ url: 'https://google.com/', name: 'testdummy' }, { url: 'https://github.com/', name: 'testdummy' }])
  console.log(doms)
}

if (require.main === module) {
  testFn()
}

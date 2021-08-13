const Newegg = require('./Newegg/Newegg')
const FileSystem = require('./FileSystem/FileSystem')

const testFn = async () => {
  const graphicsCardList = FileSystem.getGraphicsCardList('GPUList/GPUList.txt')

  const cheapestCardsPromises = []
  graphicsCardList.forEach(card => {
    const newegg = new Newegg(card)
    cheapestCardsPromises.push(newegg.getCheapestProductAllPages())
  })

  const cheapestCards = await Promise.all(cheapestCardsPromises)
  console.log(cheapestCards)
}

if (require.main === module) {
  testFn()
}

const Discord = require('discord.js')
const Newegg = require('./src/Newegg/Newegg')

const FileSystem = require('./src/FileSystem/FileSystem')

class Index {
  constructor () {
    this.client = new Discord.Client()
  }

  init () {
    this.client.on('ready', this.main.bind(this))
    this.client.login(process.env.TOKEN)
  }

  arrayPush (arr, itemsToPush) {
    itemsToPush.forEach(item => {
      arr.push(item)
    })
  }

  async processBatch (promises, cheapestCards) {
    this.arrayPush(cheapestCards, await Promise.all(promises))
    promises.splice(0, promises.length)
  }

  async main () {
    console.log('GPU Price Checker started!')
    const graphicsCardList = FileSystem.getGraphicsCardList('GPUList/GPUList.txt')
    const channel = this.client.channels.cache.get(process.env.CHANNEL_ID)
    let running = false
    setInterval(async () => {
      const start = new Date()
      console.log('Started at:', start.toISOString())
      if (running) {
        console.log('Already running, skipping!')
        return
      }
      running = true

      const cheapestCards = []
      const batchSize = Number(process.env.BROWSER_BATCH_SIZE) || 0
      const cheapestCardsPromises = []
      let batch = 0
      for (let x = 0; x < graphicsCardList.length; x++) {
        // batchSize of 0 means no batching, otherwise check if browser batch size reached
        if (batchSize !== 0 && batch === batchSize) {
          await this.processBatch(cheapestCardsPromises, cheapestCards)
          batch = 0
        }

        const newegg = new Newegg(graphicsCardList[x])
        cheapestCardsPromises.push(newegg.getCheapestProductAllPages())
        batch++
      }

      // if there are any left to process at the end, wait for them
      if (batch > 0) {
        await this.processBatch(cheapestCardsPromises, cheapestCards)
      }

      let channelMessage = ''
      cheapestCards.forEach(card => {
        channelMessage += `The cheapest ${card.name} is: $${card.price}.\nCheck it out here: ${card.link}\n\n`
      })
      channelMessage = channelMessage.substring(0, channelMessage.length - 2)
      channel.send(channelMessage)

      const end = new Date()
      console.log('Ended at:', end.toISOString())
      console.log('Time elapsed in seconds:', (end.getTime() - start.getTime()) / 1000)
      running = false
    }, Number(process.env.INTERVAL))
  }
}

if (require.main === module) {
  const index = new Index()
  index.init()
}

module.exports = Index

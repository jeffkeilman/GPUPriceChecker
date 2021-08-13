const Discord = require('discord.js')
const client = new Discord.Client()

const Newegg = require('./src/Newegg/Newegg')

const FileSystem = require('./src/FileSystem/FileSystem')

const main = () => {
  console.log('GPU Price Checker started!')
  const graphicsCardList = FileSystem.getGraphicsCardList('GPUList/GPUList.txt')
  const channel = client.channels.cache.get(process.env.CHANNEL_ID)
  setInterval(async () => {
    const start = new Date()
    console.log('Started at:', start.toISOString())
    const cheapestCardsPromises = []
    graphicsCardList.forEach(card => {
      const newegg = new Newegg(card)
      cheapestCardsPromises.push(newegg.getCheapestProductAllPages())
    })

    const cheapestCards = await Promise.all(cheapestCardsPromises)
    console.log(cheapestCards)

    let channelMessage = ''
    cheapestCards.forEach(card => {
      channelMessage += `The cheapest ${card.name} is: $${card.price}.\nCheck it out here: ${card.link}\n\n`
    })
    channelMessage = channelMessage.substring(0, channelMessage.length - 2)
    channel.send(channelMessage)

    const end = new Date()
    console.log('Ended at:', end.toISOString())
    console.log('Time elapsed in seconds:', (end.getTime() - start.getTime()) / 1000)
  }, Number(process.env.INTERVAL))
}

client.on('ready', main)

client.login(process.env.TOKEN)

const Discord = require('discord.js')
const client = new Discord.Client()

const Newegg = require('./src/Newegg/Newegg')
const { checkPricesInterval } = require('./constants/constants')

const FileSystem = require('./src/FileSystem/FileSystem')

const main = () => {
  const graphicsCardList = FileSystem.getGraphicsCardList('GPUList/GPUList.txt')
  const channel = client.channels.cache.get(process.env.CHANNEL_ID)
  setInterval(() => {
    graphicsCardList.forEach(card => {
      const newegg = new Newegg(card)
      newegg.getCheapestProductAllPages().then(data => {
        channel
          .send(`The cheapest ${newegg.getGPUName()} is: $${data.price}.\nCheck it out here: ${data.link}`)
      }).catch(err => {
        console.error(err)
      })
    })
  }, checkPricesInterval)
}

client.on('ready', main)

client.login(process.env.TOKEN)


// () => {
//   setInterval(() => {
//     // TODO: Add other sites and handling for multiple cards
//     const newegg = new Newegg('GTX 1660 Super')
//     newegg.getCheapestProductAllPages().then((res) => {
//       client.channels.cache.get(process.env.CHANNEL_ID)
//         .send(`The cheapest ${newegg.getGPUName()} is: $${res.price}.\nCheck it out here: ${res.link}`)
//     }).catch((err) => {
//       console.error(err)
//     })
//   }, checkPricesInterval)



const Discord = require('discord.js')
const client = new Discord.Client()

const Newegg = require('./src/Newegg/Newegg')
const { checkPricesInterval } = require('./constants/constants')

client.on('ready', () => {
  setInterval(() => {
    // TODO: Add other sites and handling for multiple cards
    const newegg = new Newegg('GTX 1660 Super')
    newegg.getCheapestProductAllPages().then((res) => {
      client.channels.cache.get(process.env.CHANNEL_ID)
        .send(`The cheapest ${newegg.getGPUName()} is: $${res.price}.\nCheck it out here: ${res.link}`)
    }).catch((err) => {
      console.error(err)
    })
  }, checkPricesInterval)
})

client.login(process.env.TOKEN)

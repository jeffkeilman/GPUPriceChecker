// const Newegg = require('./Newegg/Newegg')

// const newegg = new Newegg('GTX 1660 Super')

// newegg.getCheapestProductAllPages().then(console.log)

const fs = require('./FileSystem/FileSystem')

console.log(fs.getGraphicsCardList('GPUList/GPUList.txt'))

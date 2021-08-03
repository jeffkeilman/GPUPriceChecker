const fs = require('fs')
const path = require('path')

class FileSystem {
  static getGraphicsCardList (fp) {
    const filePath = path.join(__dirname, '../../' + fp)
    try {
      const data = fs.readFileSync(filePath, 'utf-8')
      return data.split('\n')
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = FileSystem

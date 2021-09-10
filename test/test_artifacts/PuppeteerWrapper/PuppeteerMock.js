const mockStubPage = {
  goto (url) {
    return Promise.resolve()
  },
  setDefaultNavigationTimeout () {
    return Promise.resolve()
  },
  content () {
    return Promise.resolve()
  },
  close () {
    return Promise.resolve()
  }
}
const mockStubBrowser = {
  newPage () {
    return Promise.resolve(module.exports.mockStubPage)
  },
  close () {
    return Promise.resolve()
  }
}

module.exports = {
  mockStubPage,
  mockStubBrowser
}

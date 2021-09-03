const mockGetGraphicsCardList = jest.fn()
const mockGetCheapestProductAllPages = jest.fn()
const mockNeweggImplementation = jest.fn().mockImplementation(() => {
  return { getCheapestProductAllPages: mockGetCheapestProductAllPages }
})
const FileSystem = require('../src/FileSystem/FileSystem')
const newegg = require('../src/Newegg/Newegg')
jest.mock('../src/Newegg/Newegg', () => {
  return mockNeweggImplementation
})
jest.mock('../src/FileSystem/FileSystem', () => {
  const mi = jest.fn().mockImplementation(() => {})
  mi.getGraphicsCardList = mockGetGraphicsCardList
  return mi
})

const mockMessageSend = jest.fn()
const mockGetChannel = jest.fn(() => {
  return {
    send: mockMessageSend
  }
})
const mockOn = jest.fn()
const mockLogin = jest.fn()
const discord = require('discord.js')
jest.mock('discord.js', () => ({
  Client: class {
    constructor () {
      this.channels = {
        cache: {
          get: mockGetChannel
        }
      }
      this.on = mockOn
      this.login = mockLogin
    }
  }
}))

beforeEach(() => {
  jest.resetModules()
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

test('index.js loading should trigger Discord channel methods', () => {
  const { main } = require('../index')

  expect(mockOn).toHaveBeenCalledTimes(1)
  expect(mockOn).toHaveBeenCalledWith('ready', main)
  expect(mockLogin).toHaveBeenCalledTimes(1)
  expect(mockLogin).toHaveBeenCalledWith('token')
})

test('processBatch should correctly add resolved promises to an array', async () => {
  const { processBatch } = require('../index')

  const promises = [Promise.resolve(4), Promise.resolve(5), Promise.resolve(6)]
  const list = [1, 2, 3]
  await processBatch(promises, list)
  expect(list).toEqual([1, 2, 3, 4, 5, 6])
  expect(promises).toEqual([])
})

test('arrayPush properly pushes items from one array to another', () => {
  const { arrayPush } = require('../index')
  const testArr1 = [1, 2]
  const testArr2 = [3, 4]

  arrayPush(testArr1, testArr2)
  expect(testArr1).toEqual([1, 2, 3, 4])
})

describe('main() tests', () => {
  const index = require('../index')
  let processBatchSpy = null

  console.log('INDEX:', index)

  beforeEach(() => {
    jest.useFakeTimers()
    // jest.spyOn(console, 'log').mockImplementation(() => null)
    processBatchSpy = jest.spyOn(index, 'processBatch').mockImplementation(() => console.log('mocked it'))
  })
  afterEach(() => jest.useRealTimers())

  test('main() should get correct graphics cards and test each one', async () => {
    mockGetGraphicsCardList.mockReturnValue(['foo', 'bar', 'baz'])
    mockGetCheapestProductAllPages.mockReturnValue(Promise.resolve({ price: 100, link: 'foo', name: 'bar' }))

    await index.main()
    jest.advanceTimersByTime(1000)

    expect(mockNeweggImplementation).toHaveBeenCalledTimes(3)
    expect(mockNeweggImplementation).toHaveBeenNthCalledWith(1, 'foo')
    expect(mockNeweggImplementation).toHaveBeenNthCalledWith(2, 'bar')
    expect(mockNeweggImplementation).toHaveBeenNthCalledWith(3, 'baz')
  })

  test('main() should invoke getCheapestProductAllPages for each graphics card in the list', async () => {
    mockGetGraphicsCardList.mockReturnValue(['foo', 'bar', 'baz'])
    mockGetCheapestProductAllPages.mockReturnValue(Promise.resolve({ price: 100, link: 'foo', name: 'bar' }))

    await index.main()
    jest.advanceTimersByTime(1000)

    expect(mockGetCheapestProductAllPages).toHaveBeenCalledTimes(3)
  })

  test('main() should call processBatch twice when process.env.BROWSER_BATCH_SIZE is 3 and 6 graphics cards are returned from getGraphicsCardList', async () => {
    mockGetGraphicsCardList.mockReturnValue(['foo', 'bar', 'fizz', 'buzz', 'lol', 'idk'])
    mockGetCheapestProductAllPages
      .mockReturnValueOnce(Promise.resolve({ price: 100, link: 'foo', name: 'bar' }))
      .mockReturnValueOnce(Promise.resolve({ price: 200, link: 'fizz', name: 'buzz' }))
      .mockReturnValueOnce(Promise.resolve({ price: 300, link: 'lol', name: 'idk' }))
      .mockReturnValueOnce(Promise.resolve({ price: 400, link: 'no', name: 'seriously' }))
      .mockReturnValueOnce(Promise.resolve({ price: 500, link: 'out', name: 'of' }))
      .mockReturnValueOnce(Promise.resolve({ price: 600, link: 'variable', name: 'ideas' }))

    await index.main()
    jest.advanceTimersByTime(1000)

    expect(processBatchSpy).toHaveBeenCalledTimes(2)
    expect(processBatchSpy).toHaveBeenNthCalledWith(1, [
      Promise.resolve({ price: 100, link: 'foo', name: 'bar' }),
      Promise.resolve({ price: 200, link: 'fizz', name: 'buzz' }),
      Promise.resolve({ price: 300, link: 'lol', name: 'idk' })
    ], [])
    expect(processBatchSpy).toHaveBeenNthCalledWith(2, [
      Promise.resolve({ price: 400, link: 'no', name: 'seriously' }),
      Promise.resolve({ price: 500, link: 'out', name: 'of' }),
      Promise.resolve({ price: 600, link: 'variable', name: 'ideas' })
    ], [
      { price: 100, link: 'foo', name: 'bar' },
      { price: 200, link: 'fizz', name: 'buzz' },
      { price: 300, link: 'lol', name: 'idk' }
    ])
  })
})

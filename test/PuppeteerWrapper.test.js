const PuppeteerWrapper = require('../src/PuppeteerWrapper/PuppeteerWrapper')
const puppeteer = require('puppeteer')
const { mockStubBrowser, mockStubPage } = require('./test_artifacts/PuppeteerMock')

// page spies
const gotoSpy = jest.spyOn(mockStubPage, 'goto')
const setDefaultNavigationTimeoutSpy = jest.spyOn(mockStubPage, 'setDefaultNavigationTimeout')
const contentSpy = jest.spyOn(mockStubPage, 'content')
const pageCloseSpy = jest.spyOn(mockStubPage, 'close')

// browser spies
const newPageSpy = jest.spyOn(mockStubBrowser, 'newPage')
const browserCloseSpy = jest.spyOn(mockStubBrowser, 'close')

// launch spy
const launchSpy = jest.spyOn(puppeteer, 'launch')

jest.mock('puppeteer', () => ({
  launch () {
    return mockStubBrowser
  }
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

test('Ensure that init initalizes a Puppeteer browser and empty pages array', async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()

  expect(launchSpy).toHaveBeenCalled()
  expect(newPuppeteer.getBrowser()).toEqual(mockStubBrowser)
  expect(newPuppeteer.getPages()).toEqual([])
})

test('Ensure that openPages opens pages', async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()
  await newPuppeteer.openPages(3)

  expect(newPageSpy).toHaveBeenCalledTimes(3)
  expect(setDefaultNavigationTimeoutSpy).toHaveBeenCalledTimes(3)
  expect(setDefaultNavigationTimeoutSpy).toHaveBeenCalledWith(0)
  expect(newPuppeteer.getPageCount()).toBe(3)
  expect(newPuppeteer.getPages()).toEqual([
    {
      id: 1,
      pageName: null,
      page: mockStubPage
    },
    {
      id: 2,
      pageName: null,
      page: mockStubPage
    },
    {
      id: 3,
      pageName: null,
      page: mockStubPage
    }
  ])
})

test('Ensure that closePages closes pages', async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()
  await newPuppeteer.openPages(3)

  expect(newPuppeteer.getPageCount()).toBe(3)
  await newPuppeteer.closePages()

  expect(pageCloseSpy).toHaveBeenCalledTimes(3)
  expect(newPuppeteer.getPageCount()).toBe(0)
  expect(newPuppeteer.getPages()).toEqual([])
})

test('Ensure that teardown closes pages and browser', async () => {
  const newPuppeteer = new PuppeteerWrapper()
  await newPuppeteer.init()
  await newPuppeteer.openPages(1)

  expect(newPuppeteer.getPageCount()).toBe(1)
  await newPuppeteer.teardown()

  expect(pageCloseSpy).toHaveBeenCalledTimes(1)
  expect(browserCloseSpy).toHaveBeenCalled()
})

describe('getDOM tests', () => {
  test('getDOM creates one page when called with a single URL object', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    const openPagesSpy = jest.spyOn(newPuppeteer, 'openPages')

    await newPuppeteer.getDOM({ url: 'foo', name: 'bar' })

    expect(openPagesSpy).toHaveBeenCalledWith(1)
    expect(newPuppeteer.getPageCount()).toBe(1)
  })

  test('getDOM creates the correct number of pages when called with an array of URL objects', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    const openPagesSpy = jest.spyOn(newPuppeteer, 'openPages')

    await newPuppeteer.getDOM([
      { url: 'foo', name: 'bar' },
      { url: 'fizz', name: 'buzz' },
      { url: 'lol', name: 'idk' }
    ])

    expect(openPagesSpy).toHaveBeenCalledWith(3)
    expect(newPuppeteer.getPageCount()).toBe(3)
  })

  test('getDOM should return a string when a single URL object is passed in', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy.mockReturnValue('foobar')

    const pageHTML = await newPuppeteer.getDOM({ url: 'foo', name: 'bar' })
    expect(typeof pageHTML).toBe('string')
  })

  test('getDOM should return an array of strings when called with an array of URL objects', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy.mockReturnValue('foobar')

    const pageHTMLList = await newPuppeteer.getDOM([
      { url: 'foo', name: 'bar' },
      { url: 'fizz', name: 'buzz' },
      { url: 'lol', name: 'idk' }
    ])

    expect(Array.isArray(pageHTMLList)).toBe(true)
    expect(pageHTMLList.every(html => typeof html === 'string')).toBe(true)
  })

  test('getDOM should return the correct content when called for a single URL', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy.mockReturnValue('foobar')

    const pageHTML = await newPuppeteer.getDOM({ url: 'https://dummyurl.com', name: 'DummyPage' })
    expect(pageHTML).toBe('foobar')
  })

  test('getDOM should return the correct array of content when called for an array of URL objects', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy
      .mockReturnValueOnce('foo')
      .mockReturnValueOnce('bar')
      .mockReturnValueOnce('baz')

    const pageHTMLList = await newPuppeteer.getDOM([
      { url: 'foo', name: 'bar' },
      { url: 'fizz', name: 'buzz' },
      { url: 'lol', name: 'idk' }
    ])
    expect(pageHTMLList.sort()).toEqual(['foo', 'bar', 'baz'].sort())
  })

  test('getDOM with single URL object should trigger the proper Puppeteer methods correctly', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy.mockReturnValue('foobar')

    await newPuppeteer.getDOM({ url: 'foo', name: 'bar' })
    expect(gotoSpy).toHaveBeenCalledTimes(1)
    expect(gotoSpy).toHaveBeenCalledWith('foo')
    expect(contentSpy).toHaveBeenCalledTimes(1)
  })

  test('getDOM with array of URL objects should trigger the proper Puppeteer methods correctly', async () => {
    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()

    contentSpy.mockReturnValue('foobar')

    await newPuppeteer.getDOM([
      { url: 'foo', name: 'bar' },
      { url: 'fizz', name: 'buzz' },
      { url: 'lol', name: 'idk' }
    ])
    expect(gotoSpy).toHaveBeenCalledTimes(3)
    expect(gotoSpy).toHaveBeenNthCalledWith(1, 'foo')
    expect(gotoSpy).toHaveBeenNthCalledWith(2, 'fizz')
    expect(gotoSpy).toHaveBeenNthCalledWith(3, 'lol')
    expect(contentSpy).toHaveBeenCalledTimes(3)
  })

  test('getDOM called with improper argument should throw exception', async () => {
    // suppress console.error for this test
    jest.spyOn(console, 'error').mockImplementation(() => null)

    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()
    await expect(() => newPuppeteer.getDOM(1))
      .rejects
      .toThrow('Passed an improper argument instead of an array of URL objects, or single URL object')
  })

  test('getDOM called with empty URL array should throw exception', async () => {
    // suppress console.error for this test
    jest.spyOn(console, 'error').mockImplementation(() => null)

    const newPuppeteer = new PuppeteerWrapper()
    await newPuppeteer.init()
    await expect(() => newPuppeteer.getDOM([]))
      .rejects
      .toThrow('Passed a url array with no urls')
  })
})

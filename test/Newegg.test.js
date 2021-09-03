const Newegg = require('../src/Newegg/Newegg')
const fs = require('fs')
const path = require('path')

const fp1 = path.join(__dirname, 'test_artifacts/Newegg_items1.html')
const fp2 = path.join(__dirname, 'test_artifacts/Newegg_items2.html')
const fp3 = path.join(__dirname, 'test_artifacts/Newegg_items3.html')
const fp4 = path.join(__dirname, 'test_artifacts/Newegg_items4.html')
const mockHTML1 = fs.readFileSync(fp1, 'utf-8')
const mockHTML2 = fs.readFileSync(fp2, 'utf-8')
const mockHTML3 = fs.readFileSync(fp3, 'utf-8')
const mockHTML4 = fs.readFileSync(fp4, 'utf-8')

const mockInit = jest.fn()
const mockTeardown = jest.fn()
const mockGetDOM = jest.fn((urls) => {
  const isObject = typeof (urls) === 'object'
  const isArray = Array.isArray(urls)

  if (isObject && !isArray) {
    // first call to getDOM, gets first page
    return mockHTML1
  } else if (isObject && isArray) {
    // second call to getDOM, gets all pages but first page
    return [mockHTML2, mockHTML3, mockHTML4]
  }
})
jest.mock('../src/PuppeteerWrapper/PuppeteerWrapper', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getDOM: mockGetDOM,
      init: mockInit,
      teardown: mockTeardown
    }
  })
})

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

test('Checks that Newegg constructor correctly sets gpuName, and getGPUName correctly returns it', () => {
  const newegg = new Newegg('foobar')
  expect(newegg.getGPUName()).toBe('foobar')
})

describe('Tests link functionality', () => {
  // no spaces
  const neweggNoSpaces = new Newegg('foobar')
  // spaces
  const neweggSpaces = new Newegg('foo bar baz')

  test('Checks getBaseLink functionality using GPU name with no spaces', () => {
    expect(neweggNoSpaces.getBaseLink()).toBe('https://www.newegg.com/p/pl?d=foobar&N=100007709%204131')
  })

  test('Checks getBaseLink functionality using GPU name with spaces', () => {
    expect(neweggSpaces.getBaseLink()).toBe('https://www.newegg.com/p/pl?d=foo+bar+baz&N=100007709%204131')
  })

  test('Checks getPageLink functionality for proper link format', () => {
    expect(neweggNoSpaces.getPageLink(2)).toBe('https://www.newegg.com/p/pl?d=foobar&N=100007709%204131&page=2')
  })

  test('Ensures getNumberOfPages returns the number of pages given current HTML format', () => {
    const dummyPageHTML = '<span class="list-tool-pagination-text">Page<!-- --> <strong>1<!-- -->/<!-- -->2</strong></span>'
    expect(neweggNoSpaces.getNumberOfPages(dummyPageHTML)).toBe(2)
  })
})

describe('Tests getCheapestProduct single and multi-page functionality', () => {
  test('Tests getCheapestProductSinglePage with predefined HTML to ensure the cheapest product is returned', () => {
    const newegg = new Newegg('GTX 1660 Super')
    expect(newegg.getCheapestProductSinglePage(mockHTML1)).toEqual({
      price: 500.00,
      link: 'item2'
    })
  })

  test('Tests getCheapestProductAllPages to ensure multiple pages are correctly parsed for cheapest product', async () => {
    // suppress console.log for this test
    jest.spyOn(console, 'log').mockImplementation(() => null)

    const newegg = new Newegg('GTX 1660 Super')
    const getNumberOfPagesSpy = jest.spyOn(newegg, 'getNumberOfPages').mockImplementation(() => 4)

    const card = await newegg.getCheapestProductAllPages()
    expect(mockInit).toHaveBeenCalled()
    expect(mockTeardown).toHaveBeenCalled()

    expect(getNumberOfPagesSpy).toHaveBeenCalledWith(mockHTML1)
    expect(mockGetDOM).toHaveBeenCalledTimes(2)
    expect(mockGetDOM).toHaveBeenNthCalledWith(1, {
      url: 'https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709%204131',
      name: 'GTX 1660 Super p. 1'
    })
    expect(mockGetDOM).toHaveBeenNthCalledWith(2, [
      {
        url: 'https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709%204131&page=2',
        name: 'GTX 1660 Super p. 2'
      },
      {
        url: 'https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709%204131&page=3',
        name: 'GTX 1660 Super p. 3'
      },
      {
        url: 'https://www.newegg.com/p/pl?d=GTX+1660+Super&N=100007709%204131&page=4',
        name: 'GTX 1660 Super p. 4'
      }
    ])

    expect(card).toEqual({
      price: 200,
      name: 'GTX 1660 Super',
      link: 'item4'
    })
  })
})

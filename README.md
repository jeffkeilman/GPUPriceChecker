# GPUPriceChecker
## Table of Contents
- [GPUPriceChecker](#gpupricechecker)
  - [Table of Contents](#table-of-contents)
  - [Summary](#summary)
  - [Quick Start](#quick-start)
  - [Testing](#testing)
  - [Code Style](#code-style)
  - [index.js](#indexjs)
    - [Description](#description)
    - [Index Class](#index-class)
      - [Attributes](#attributes)
      - [Methods](#methods)
  - [FileSystem.js](#filesystemjs)
    - [Description](#description-1)
    - [FileSystem Class](#filesystem-class)
      - [Attributes](#attributes-1)
      - [Methods](#methods-1)
  - [Newegg.js](#neweggjs)
    - [Description](#description-2)
    - [Newegg Class](#newegg-class)
      - [Attributes](#attributes-2)
      - [Methods](#methods-2)
  - [PuppeteerWrapper.js](#puppeteerwrapperjs)
    - [Description](#description-3)
    - [PuppeteerWrapper Class](#puppeteerwrapper-class)
      - [Attributes](#attributes-3)
      - [Methods](#methods-3)
  - [constants.js](#constantsjs)
    - [Description](#description-4)
  - [GPUList.txt](#gpulisttxt)
    - [Description](#description-5)

----------------------------------------------------------------------

## Summary
A [Discord.js](https://discord.js.org/) bot using [jsdom](https://www.npmjs.com/package/jsdom) and Headless Chromium via [Puppeteer](https://pptr.dev/) to scrape ecommerce websites for prices for a predefined list of desktop graphics cards. Tested using [Jest](https://jestjs.io/).

***NOTE:*** **This software is provided in accordance with the MIT License, PLEASE READ THE LICENSE AND UNDERSTAND YOUR RIGHTS AS A USER AND/OR DEVELOPER WHO CONTRIBUTES TO THIS SOFTWARE OR USES IT IN YOUR PROJECTS! Some companies have been known to recklessly block IP addresses of computers who appear to be scraping their websites. Please research web scraping before using this software, and use it with caution.**

----------------------------------------------------------------------

## Quick Start
1. Clone the `GPUPriceChecker` repo
2. `cd` into the `GPUPriceChecker/` directory
3. Run `npm i`
4. Set environment variables:
     - Run `export TOKEN=[your Discord bot token]`
     - Run `export CHANNEL_ID=[the channel you want the bot to spam]`
     - Run `export BROWSER_BATCH_SIZE=[desired batch size, 0=no batching]`
     - Run `export INTERVAL=[desired run interval in ms]`
5. Run `npm run start`

----------------------------------------------------------------------

## Testing
Testing is executed using [Jest](https://jestjs.io/). All test files are maintained in the `GPUPriceChecker/test/` directory. To run unit tests, run `npm run test`.

----------------------------------------------------------------------

## Code Style
All code is styled using [JavaScript Standard Style](https://standardjs.com/).

----------------------------------------------------------------------

## index.js
### Description
The entry point for the Discord bot. When `index.js` is initialized, a new `Index` Object is created and its `init` method is invoked. This logs the Discord bot in (using `process.env.TOKEN`) and, when the bot is ready, invokes the `main` method.


### Index Class
#### Attributes
| Attribute   | Description |
| :---------- | ----------- |
| client      | A `Discord.Client()` instance. |


#### Methods
| Method      | Description |
| :---------- | ----------- |
| constructor ()<br />returns: `undefined` | Initializes the `client` attribute with a new `Discord.Client()` |
| init ()<br />returns: `undefined`       | Invokes `Discord.Client.prototype.on` and `Discord.Client.prototype.login` to log<br />the Discord bot in (using `process.env.TOKEN`) and, on 'ready', invoke `this.main`. |
| arrayPush (arr, itemsToPush)<br />returns: `undefined` | Takes `arr`, an Array, and `itemsToPush`, an Array, as arguments.<br />Pushes all items from `itemsToPush` into `arr` in place. |
| processBatch (promises, cheapestCards)<br />returns: Promise.resolve(`undefined`) | Awaits all Promises in `promises`, an Array, and pushes the results of these<br />resolved Promises into `cheapestCards`, an Array. `promises` is emptied. |
| main ()<br />returns: Promise.resolve(`undefined`) | The main flow of this bot. Reads the list of desktop graphics cards from a file once,<br />and then sets an interval that finds the cheapest of each of those graphics cards on<br />Newegg using Puppeteer and jsdom every `process.env.INTERVAL` milliseconds. |

----------------------------------------------------------------------

## FileSystem.js
### Description
Methods that wrap `Node.js`'s `fs` module.


### FileSystem Class
#### Attributes
None


#### Methods
| Method      | Description |
| :---------- | ----------- |
| static getGraphicsCardList (fp)<br />returns: Array[String] | Opens a text file with a list of graphics cards located at `GPUPriceChecker/[fp]` <br />(*format ex. 'card_1\ncard_2\n...'*) and parses that list into an array of Strings. |

----------------------------------------------------------------------

## Newegg.js
### Description
A Class that contains all of the methods and attributes required to scrape Newegg product pages to find the cheapest desktop graphics cards.


### Newegg Class
#### Attributes
| Attribute   | Description |
| :---------- | ----------- |
| gpuName     | The String name of the graphics card this instance is looking up |


#### Methods
| Method      | Description |
| :---------- | ----------- |
| constructor (gpuName)<br />returns: `undefined` | Initializes `this.gpuName` with the `gpuName` String parameter |
| getGPUName ()<br />returns: String | Getter returns `this.gpuName` |
| getBaseLink ()<br />returns: String | Builds and returns a URL which directs to the first page of results for `this.gpuName` |
| getPageLink (page)<br />returns: String | Builds and returns a URL which directs to the page of results represented by the Number<br />`page` parameter for `this.gpuName` |
| getNumberOfPages (pageHTML)<br />returns: Number | Scrapes the given String `pageHTML` in order to determine the number of pages that must<br />be scraped for a given GPU |
| getCheapestProductSinglePage (pageHTML)<br />returns: Object | Scrapes the given String `pageHTML` in order to determine the cheapest GPU on that page |
| getCheapestProductAllPages ()<br />returns: Promise.resolve(Object) | The main flow of the Newegg Class. Finds the number of pages that must be scraped,<br />then scrapes each one of these pages to find the cheapest `this.gpuName` available. |

----------------------------------------------------------------------

## PuppeteerWrapper.js
### Description
A Class that wraps a Headless Chrome browser (using Puppeteer) and its pages and exposes simple methods to help retrieve HTML from lists of links.


### PuppeteerWrapper Class
#### Attributes
| Attribute   | Description |
| :---------- | ----------- |
| pages       | An Array[Object] that holds pages and page metadata |
| browser     | A Puppeteer browser |


#### Methods
| Method      | Description |
| :---------- | ----------- |
| init ()<br />returns: Promise.resolve(`undefined`) | Async method that must be called after initializing a new `PuppeteerWrapper`.<br />It sets `this.pages` to an empty Array and sets `this.browser` after awaiting<br />the launch of a new Puppeteer browser. |
| getBrowser ()<br />returns: Object | Getter that returns `this.browser` Object, which contains a Puppeteer browser<br />and metadata |
| getPages ()<br />returns: Array[Object] | Getter that returns `this.pages` Array, which contains a list of page Objects with<br />Puppeteer pages and metadata |
| getPageCount ()<br />returns: Number | Returns `this.pages.length` |
| getPageById (id)<br />returns: Object | Returns the page Object with a given Number `id` |
| getPageByName (name)<br />returns: Object | Returns the page Object with a given String `name` |
| closePages ()<br />returns: Promise.resolve(`undefined`) | Loops through `this.pages`, closing every Puppeteer page, and then empties<br />`this.pages` |
| teardown ()<br />returns: Promise.resolve(`undefined`) | Closes all pages, and then closes `this.browser` |
| openPages (num)<br />returns: Promise.resolve(`undefined`) | Opens Number `num` Puppeteer pages and adds them to `this.pages` |
| getDOM (urls)<br />returns: Promise.resolve(String or Array[String]) | Can be called with a single URL Object (containing String URL,<br />and String GPU name), or an Array of URL Objects. Will return<br />the HTML for the single URL/list of URLs. |

----------------------------------------------------------------------

## constants.js
### Description
Exports an Object containing constants that are used in many places around the app.

----------------------------------------------------------------------

## GPUList.txt
### Description
A text list of GPUs to search for in a given run, separated by newlines.
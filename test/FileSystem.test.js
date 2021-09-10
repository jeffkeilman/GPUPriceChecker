const FileSystem = require('../src/FileSystem/FileSystem')
const fs = require('fs')

describe('File system tests', () => {
  test('Checks that predefined file returns correct content', () => {
    const fsSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('foo\nbar')
    const data = FileSystem.getGraphicsCardList('fakelink.txt')
    expect(data.sort()).toEqual(['foo', 'bar'].sort())
    fsSpy.mockRestore()
  })
})

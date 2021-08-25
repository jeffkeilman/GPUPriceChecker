const FileSystem = require('../src/FileSystem/FileSystem')

test('Checks that predefined file returns correct content', () => {
  const data = FileSystem.getGraphicsCardList('test/test_artifacts/FileSystem_test.txt')
  expect(data.sort()).toEqual(['foo', 'bar'].sort())
})

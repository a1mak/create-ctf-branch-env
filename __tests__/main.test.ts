import { normalizeBranchName } from '../src/utils/normalize-branch-name'
import { expect, test } from '@jest/globals'

test('transforms branch name to proper contentful format', async () => {
  const name1 = 'refs/heads/feat/foo-bar'
  const name2 = 'feat/foo-bar'

  expect(normalizeBranchName(name1)).toEqual('feat-foo-bar')
  expect(normalizeBranchName(name2)).toEqual('feat-foo-bar')
})

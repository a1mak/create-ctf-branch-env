// normalize git-flow branch names ie. feat/foo-feature -> feat-foo-feature
const normalizeBranchName = (branchName: string) =>
  branchName.replace('refs/heads/', '').replace(/\//g, '-')

export { normalizeBranchName }

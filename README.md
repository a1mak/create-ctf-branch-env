<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

Contentful Environment Creation GitHub Action

This GitHub action automates creation of a new Contentful environment for each Git branch that is created in your repository. This can help you manage your Contentful environments more efficiently, as it ensures that each branch has its own environment to work in.

### Prerequisites

You will need to have the following in place before you can use this action:

- A Contentful account
- A Management API key

### Setting up the action

To set up the action, follow these steps:

1. Add the following secrets to your GitHub repository:

   - `CONTENTFUL_MANAGEMENT_API_KEY`: Your Contentful management API key
   - `CONTENTFUL_SPACE_ID`: Your Contentful space ID

2. Create a new workflow file (e.g., `create-environment.yml`) in your `.github/workflows` directory with the following contents:

```
name: Create Contentful environment for branch

on:
  create

jobs:
  create-environment:
    if: |
      github.event.ref_type == 'branch' &&
      startswith(github.event.ref, 'feat/')
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Create Contentful environment
        uses: a1mak/create-ctf-branch-env@v0.1.0
        with:
          source_environment_id: master
          environment_name_prefix: BR-
        env:
          SPACE_ID: ${{ secrets.CONTENTFUL_SPACE_ID }}
          MANAGEMENT_ACCESS_TOKEN: ${{ secrets.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN }}
```
3. Commit and push your changes to your repository.

That's it! Now, every time a new branch is created in your repository, a new Contentful environment will be created with the normalized branch name.

## Branch name normalization

The branch name will be normalized as follows:

- Any forward slashes (`/`) will be replaced with hyphens (`-`).

For example, the branch name `feat/foo-feature` would be normalized to `feat-foo-feature`. This normalized name will be used as the environment name, with the `environment_name_prefix` (if specified) added to the beginning.

## Inputs

This action requires the following inputs:

- `source_environment_id` (optional): The ID of the Contentful environment that will be used as a source for the new environment. This defaults to `master`.
- `environment_name_prefix` (optional): The prefix that will be added to the branch name to create the new environment.

## Outputs

This action produces the following output:

- `environment_name` : The name of the Contentful environment created.

## License

This action is released under the MIT license. See [LICENSE](LICENSE) for details.



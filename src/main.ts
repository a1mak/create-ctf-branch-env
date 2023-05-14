import * as core from '@actions/core'
import { context } from '@actions/github'
import type { Context } from '@actions/github/lib/context'
import type { CreateEvent } from '@octokit/webhooks-types'
import { createClient } from 'contentful-management'
import { normalizeBranchName } from './utils/normalize-branch-name'

interface CreateBranchContext extends Context {
  payload: CreateEvent
}

function isCreateBranchContext(ctx: Context): ctx is CreateBranchContext {
  return ctx.eventName === 'create' && ctx.payload.ref_type === 'branch'
}

async function run(ctx: Context): Promise<void> {
  try {
    const { SPACE_ID, MANAGEMENT_ACCESS_TOKEN } = process.env

    if (!SPACE_ID || !MANAGEMENT_ACCESS_TOKEN) {
      throw Error(
        'Contentful connecton data required. Please provide SPACE_ID and MANAGEMENT_ACCESS_TOKEN'
      )
    }

    if (!isCreateBranchContext(ctx)) {
      throw Error(
        `Event "${ctx.eventName}" on ref_type "${ctx.payload.ref_type}" is not supported. This action can be executed only on "create branch" event`
      )
    }

    const payload = ctx.payload

    const sourceEnvId = core.getInput('source_environment_id')
    const envNamePrefix = core.getInput('environment_name_prefix')

    const envName = envNamePrefix + normalizeBranchName(payload.ref)

    core.info('Connecting to contentful space...')

    const client = createClient({ accessToken: MANAGEMENT_ACCESS_TOKEN })
    const space = await client.getSpace(SPACE_ID)

    core.info('Connection established.')
    core.info('Creating contentful environment...')

    try {
      await space.getEnvironment(envName)
      core.info(
        `Contentful environment with name ${envName} already exists. Skipping action.`
      )
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      const response = JSON.parse(error.message)

      if (response.status !== 404) {
        throw Error(error.message)
      }

      const { sys } = await space.createEnvironmentWithId(
        envName,
        { name: envName },
        sourceEnvId
      )

      core.info(`Created contentful environment ${envName}`)
      core.setOutput('environment_name', envName)

      const newEnv = {
        sys: {
          type: 'Link',
          linkType: 'Environment',
          id: sys.id
        }
      }
      const { items: keys } = await space.getApiKeys()

      await Promise.all(
        keys.map(key => {
          core.info(`Updating: "${key.sys.id}"`)
          key.environments.push(newEnv)
          return key.update()
        })
      )
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run(context)

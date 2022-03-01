const {TelegramClient, Api} = require('telegram')
const {StoreSession} = require('telegram/sessions')
const input = require('input')
const os = require('os')
const path = require('path')
const fs = require('fs/promises')
const _flow = require('lodash/fp/flow')
const _split = require('lodash/fp/split')
const _filter = require('lodash/fp/filter')
const _identity = require('lodash/fp/identity')
const _uniqBy = require('lodash/fp/uniqBy')
const _map = require('lodash/fp/map')
const _trim = require('lodash/fp/trim')

const sessionPath = path.resolve(os.tmpdir(), 'telegram_session')
const authFilePath = path.resolve(os.tmpdir(), 'telegram_auth.json')

module.exports = {
  async getClient ({apiId, apiHash}) {
    if (!apiId || !apiHash) throw new Error('"apiId" and "apiHash" are required!')

    const client = new TelegramClient(new StoreSession(sessionPath), apiId, apiHash, {connectionRetries: 5})

    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () => await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    })
    await client.session.save()

    return client
  },

  async readChannelsList (channelsFile) {
    const content = await fs.readFile(channelsFile, 'utf-8')
    return _flow(
      _split('\n'),
      _map(_trim),
      _filter(Boolean),
      _uniqBy(_identity)
    )(content)
  },

  async reportChannel ({client, channel, blockMessage}) {
    const entity = await client.getEntity(channel)
    await client.invoke(new Api.account.ReportPeer({
      peer: entity,
      reason: new Api.InputReportReasonOther(),
      message: blockMessage
    }))
  },

  async sleep (duration = 100) {
    return new Promise(resolve => setTimeout(resolve, duration))
  },

  async getAppDetails () {
    const fileExists = await this.isFileExists(authFilePath)
    let apiId
    let apiHash


    if (fileExists) {
      try {
        const configJson = await fs.readFile(authFilePath, 'utf-8')
        const config = JSON.parse(configJson)
        apiId = Number(config.apiId)
        apiHash = config.apiHash
      } catch (err) { }
    }

    if (!apiId) apiId = Number(await input.text("Please enter your apiId: "))
    if (!apiHash) apiHash = await input.text("Please enter your apiHash: ")

    if (!fileExists) await fs.writeFile(authFilePath, JSON.stringify({apiId, apiHash}))

    return {apiId, apiHash}
  },

  async isFileExists (file) {
    try {
      await fs.access(file)
      return true
    } catch {
      return false
    }
  }
}

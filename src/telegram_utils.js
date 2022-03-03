const {bold} = require('ansi-colors')
const {TelegramClient, Api} = require('telegram')
const {StringSession} = require('telegram/sessions')
const input = require('input')
const fs = require('fs/promises')
const _flow = require('lodash/fp/flow')
const _split = require('lodash/fp/split')
const _filter = require('lodash/fp/filter')
const _identity = require('lodash/fp/identity')
const _uniqBy = require('lodash/fp/uniqBy')
const _map = require('lodash/fp/map')
const _trim = require('lodash/fp/trim')
const {config} = require('./config')

module.exports = {
  async getClient ({apiId, apiHash}) {
    if (!apiId || !apiHash) throw new Error('"apiId" and "apiHash" are required!')

    const session = config.get('session')
    const client = new TelegramClient(new StringSession(session), apiId, apiHash, {connectionRetries: 5})

    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.password("Please enter your password: "),
      phoneCode: async () => await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    })

    if (!session) config.set('session', client.session.save())

    return client
  },

  async readChannelsList (channelsFile) {
    const content = await fs.readFile(channelsFile, 'utf-8')
    return this.parseChannels(content)
  },

  async parseChannels (content) {
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
    const apiConfig = config.get('api')
    let apiId = apiConfig?.apiId
    let apiHash = apiConfig?.apiHash

    if (!apiId) {
      console.log(`This application needs your Telegram API authentication details.
  1. Login into your Telegram account here ${bold('https://my.telegram.org/')}
  2. Then click "API development tools" and fill your application details (only app title and short name required)
  3. Finally, click "Create application"
`)
      apiId = Number(await input.text("Please enter your Telegram apiId: "))
      config.set('api.apiId', apiId)
    }
    if (!apiHash) {
      apiHash = await input.text("Please enter your apiHash: ")
      config.set('api.apiHash', apiHash)
    }

    return {apiId, apiHash}
  }
}

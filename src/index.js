const cliProgress = require('cli-progress')
const telegramUtils = require('./telegram_utils')
const logo = require('./logo')
const _isEmpty = require('lodash/fp/isEmpty')

const arguments = [].concat(process.argv)
const channelsFile = arguments[2]

if (!channelsFile) throw new Error('No channels file provided. Call: telegram-report-... channels.txt')

console.log(logo)

// const apiId = 12345678
// const apiHash = '123456abcdfg'
const blockMessage = `Propaganda of the war in Ukraine. Propaganda of the murder of Ukrainians and Ukrainian soldiers\n\nThe channel undermines the integrity of the Ukrainian state. Spreading fake news, misleading people. Block it as soon as possible!`

const progressBar = new cliProgress.SingleBar({
  format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total} | {channel}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
}, cliProgress.Presets.shades_classic);

const run = async () => {
  const {apiId, apiHash} = await telegramUtils.getAppDetails()
  const client = await telegramUtils.getClient({apiId, apiHash})
  const channels = await telegramUtils.readChannelsList(channelsFile)

  console.log(`Starting to report ${channels.length} channels...\n`)
  progressBar.start(channels.length, 0, {channel: ''});

  let counter = 0
  let reportedChannels = 0
  let start
  const failedChannels = {}

  for (let channel of channels) {
    try {
      start = Date.now()
      progressBar.update(counter, {channel})
      await telegramUtils.reportChannel({client, channel, blockMessage})
      reportedChannels += 1
    } catch (error) {
      failedChannels[channel] = error.message
      // console.warn(`-- Failed to report channel: ${channel}`)
      // console.debug(error)
    } finally {
      counter += 1
      await telegramUtils.sleep(1000 - Date.now() + start)
      progressBar.update(counter, {channel: ''})
    }
  }

  progressBar.stop()
  console.log(`\nReported ${reportedChannels} channels`)
  if (!_isEmpty(failedChannels)) console.log('Failed to report these channels:', failedChannels)

  await client.destroy()
}

run()
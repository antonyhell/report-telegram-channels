const cliProgress = require('cli-progress')
const telegramUtils = require('./telegram_utils')

const arguments = [].concat(process.argv)
const channelsFile = arguments[2]

if (!channelsFile) throw new Error('No channels file provided. Call: telegram-report-... channels.txt')

console.log(`
 ___   _        _    __   __    _
/ __| | |      /_\\   \\ \\ / /   /_\\
\\__ \\ | |__   / _ \\   \\ V /   / _ \\
|___/ |____| /_/ \\_\\   \\_/   /_/ \\_\\
 _   _   _  __  ___     _        _   ___   _  _   ___
| | | | | |/ / | _ \\   /_\\    _ | | |_ _| | \\| | |_ _|
| |_| | | ' <  |   /  / _ \\  | || |  | |  | .\` |  | |
 \\___/  |_|\\_\\ |_|_\\ /_/ \\_\\  \\__/  |___| |_|\\_| |___|
`)

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

  console.log(`Starting to report ${channels.length} channels...`)
  progressBar.start(channels.length, 0, {channel: ''});

  let counter = 0
  let reportedChannels = 0

  for (let channel of channels) {
    try {
      progressBar.update(counter, {channel})
      await telegramUtils.reportChannel({client, channel, blockMessage})
      reportedChannels += 1
    } catch (error) {
      console.warn(`-- Failed to report channel: ${channel}`)
      console.debug(error)
    } finally {
      counter += 1
      await telegramUtils.sleep()
      progressBar.update(counter, {channel: ''})
    }
  }

  progressBar.stop()
  console.log(`Reported ${reportedChannels} channels`)

  await client.destroy()
}

run()
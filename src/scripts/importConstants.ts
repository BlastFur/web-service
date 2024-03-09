import { Constant } from '../db/models'
import env from './env'

const constants: Array<[string, string | number]> = [
  ['taskTweetId', '11111111'],
  ['blastfurTwitterName', 'BlastFur'],
  [
    'blastfurTwitterFollowLink',
    'https://twitter.com/intent/follow?region=follow_link&screen_name=BlastFur',
  ],
  ['blastfurDiscordJoinLink', 'https://discord.com/invite/ZYMzybZQ'],
  ['initialPoints', 50],
]

async function tasks(): Promise<void> {
  for (const [name, value] of constants) {
    await Constant.findOrCreatePyName(name, value)
    console.log(`check ${name}`)
  }
}

env(tasks).catch((e) => console.error(e))

import { Event } from '../db/models'
import env from './env'

const events: Array<[string, number]> = [['init', 50]]

async function tasks(): Promise<void> {
  for (const [code, points] of events) {
    await Event.findOrCreate({
      where: {
        code,
      },
      defaults: {
        code,
        points,
      },
    })
    console.log(`check ${code}`)
  }
}

env(tasks).catch((e) => console.error(e))

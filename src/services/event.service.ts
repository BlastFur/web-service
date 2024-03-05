import { User } from '../db/models'
import UserEvent, { UserEventData, UserEventMap } from '../db/models/UserEvent'
import taskServices from './task.service'

export async function fetchUserEventData(user: User): Promise<UserEventData> {
  const userEvent = await UserEvent.findOrCreateUserEvent(user)
  return userEvent.getData()
}

export async function tryInitEvent(user: User): Promise<boolean> {
  const ues = await UserEventMap.findByUserIdEventCode(user.id, 'init')
  const finished = ues.length > 0
  if (finished) return false
  const twitterTaskRecord = await taskServices.fetchUserTwitterTaskRecord(user)
  const discordTaskRecord = await taskServices.fetchUserDiscordTaskRecord(user)
  if (!twitterTaskRecord.allCleared || !discordTaskRecord.allCleared) {
    return false
  }
  await UserEventMap.pushEvent(user.id, 'init')
  return true
}

const eventServices = {
  fetchUserEventData,
  tryInitEvent,
}

export default eventServices

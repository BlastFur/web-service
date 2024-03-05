import { DiscordTaskRecord, TwitterTaskRecord, User } from '../db/models'
import { DiscordTaskRecordData } from '../db/models/DiscordTaskRecord'
import { TwitterTaskRecordData } from '../db/models/TwitterTaskRecord'
import UserEvent, { UserEventData } from '../db/models/UserEvent'

export async function fetchUserTwitterTaskRecord(
  user: User
): Promise<TwitterTaskRecordData> {
  const twitterTaskRecord = await TwitterTaskRecord.findOrCreateTaskRecord(user)
  return twitterTaskRecord.getData()
}

export async function fetchUserDiscordTaskRecord(
  user: User
): Promise<DiscordTaskRecordData> {
  const discordTaskRecord = await DiscordTaskRecord.findOrCreateTaskRecord(user)
  return discordTaskRecord.getData()
}

const taskServices = {
  fetchUserTwitterTaskRecord,
  fetchUserDiscordTaskRecord,
}

export default taskServices

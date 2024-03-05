import { User } from '../db/models'
import eventServices from './event.service'

export async function tryInitProcess(user: User): Promise<boolean> {
  // events
  const did = await eventServices.tryInitEvent(user)
  if (!did) return false
  // TODO: bags
  return true
}

const otherServices = {
  tryInitProcess,
}

export default otherServices

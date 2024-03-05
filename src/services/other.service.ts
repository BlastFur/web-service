import { User } from '../db/models'
import eventServices from './event.service'
import petServices from './pet.service'

export async function tryInitProcess(user: User): Promise<boolean> {
  // events
  let did = await eventServices.tryInitEvent(user)
  if (!did) return false
  // TODO: bags
  did = await petServices.tryInitPet(user)
  return did
}

const otherServices = {
  tryInitProcess,
}

export default otherServices

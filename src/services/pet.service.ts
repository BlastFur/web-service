import { Pet, User } from '../db/models'
import UserPetMap, { UserPetData } from '../db/models/UserPet'
import { randomPick } from '../utils'

function processJSON(data: any): any {
  if (typeof data !== 'string') return data
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

export async function fetchUserPets(user: User): Promise<UserPetData[]> {
  const userPets = await UserPetMap.findAll({
    where: {
      userId: user.id,
    },
    include: [Pet],
  })
  return userPets.map((pet) => ({
    initial: pet.initial,
    code: pet.pet!.code,
    meta: processJSON(pet.pet!.data),
    instance: processJSON(pet.data),
  }))
}

export async function tryInitPet(user: User): Promise<boolean> {
  const exsit = await UserPetMap.findOne({
    where: {
      userId: user.id,
      initial: true,
    },
  })
  if (exsit) return true
  const initialPetCode = randomPick([
    '0001',
    '0002',
    '0003',
    '0004',
    '0005',
    '0006',
  ])

  await UserPetMap.pushPet(user.id, initialPetCode, true)
  return true
}

const petServices = {
  fetchUserPets,
  tryInitPet,
}

export default petServices

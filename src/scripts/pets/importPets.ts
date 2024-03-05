import { Pet } from '../../db/models'
import env from '../env'
import pets from './pets.temp.json'

async function tasks(): Promise<void> {
  for (const pet of pets) {
    await Pet.createPet(pet.code, pet.data)
    console.log(`check ${pet.code}`)
  }
}

env(tasks).catch((e) => console.error(e))

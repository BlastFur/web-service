import {
  Table,
  Column,
  AllowNull,
  DataType,
  Model,
  ForeignKey,
  Default,
  BelongsTo,
} from 'sequelize-typescript'
import User from './User'
import Pet, { BasePatData } from './Pet'

export interface UserPetData {
  initial: boolean
  code: string
  meta: BasePatData
  instance: BasePatData
}

@Table({
  modelName: 'userPetMap',
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['petId'],
    },
  ],
})
export default class UserPetMap extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  get userId(): number {
    return this.getDataValue('userId')
  }

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Pet)
  get petId(): number {
    return this.getDataValue('petId')
  }

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  get initial(): boolean {
    return this.getDataValue('initial')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get order(): number {
    return this.getDataValue('order')
  }

  @AllowNull(false)
  @Column(DataType.JSON)
  get data(): BasePatData {
    return this.getDataValue('data')
  }

  @BelongsTo(() => User)
  get user(): User | undefined {
    return this.getDataValue('user')
  }

  set user(user: User | undefined) {
    //
  }

  @BelongsTo(() => Pet)
  get pet(): Pet | undefined {
    return this.getDataValue('pet')
  }

  set pet(pet: Pet | undefined) {
    //
  }

  static async pushPet(
    userId: number,
    petCode: string,
    initial = false,
    data?: BasePatData
  ): Promise<UserPetMap> {
    const pet = await Pet.findOne({
      where: {
        code: petCode,
      },
    })
    if (!pet) {
      throw new Error('pet not found')
    }
    const p = await UserPetMap.sequelize!.transaction(async (transaction) => {
      const p = await UserPetMap.create(
        {
          userId: userId,
          petId: pet.id,
          data: data ?? pet.data,
          initial,
        },
        {
          transaction,
        }
      )
      return p
    })
    return p
  }
}

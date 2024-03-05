import { Table, Column, AllowNull, DataType, Model } from 'sequelize-typescript'

export interface BasePatData {
  defaultImage: string
}

@Table({
  modelName: 'pet',
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
  ],
})
export default class Pet extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(50))
  get code(): string {
    return this.getDataValue('code')
  }

  @AllowNull(false)
  @Column(DataType.JSON)
  get data(): BasePatData {
    return this.getDataValue('data')
  }

  static async createPet(code: string, data: BasePatData): Promise<Pet> {
    const [pet, created] = await Pet.findOrCreate({
      where: {
        code,
      },
      defaults: {
        code,
        data,
      },
    })
    return pet
  }
}

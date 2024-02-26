import { Table, Column, AllowNull, DataType, Model } from 'sequelize-typescript'

@Table({
  modelName: 'user',
  indexes: [],
})
export default class User extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(100))
  get address(): string {
    return this.getDataValue('address')
  }

  static async findByUuid(uuid: string): Promise<User | null> {
    return await this.findOne({
      where: {
        address: uuid,
      },
    })
  }
}

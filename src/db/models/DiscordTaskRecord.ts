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

export interface DiscordTaskRecordData {
  joinRecordId: number
  allCleared: boolean
}

@Table({
  modelName: 'discordTaskRecord',
  indexes: [],
})
export default class DiscordTaskRecord extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  get userId(): number {
    return this.getDataValue('userId')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get joinRecordId(): number {
    return this.getDataValue('joinRecordId')
  }

  @BelongsTo(() => User)
  get user(): User | undefined {
    return this.getDataValue('user')
  }

  set user(user: User | undefined) {
    //
  }

  get allCleared(): boolean {
    return this.joinRecordId > 0
  }

  static async findOrCreateTaskRecord(user: User): Promise<DiscordTaskRecord> {
    const exsit = await DiscordTaskRecord.findOne({
      where: {
        userId: user.id,
      },
    })
    if (exsit) {
      return exsit
    }
    return await DiscordTaskRecord.create({
      userId: user.id,
    })
  }

  getData(): DiscordTaskRecordData {
    return {
      joinRecordId: this.joinRecordId,
      allCleared: this.allCleared,
    }
  }
}

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
import Constant from './Constant'

export interface TwitterTaskRecordData {
  likeRecordId: number
  retweetRecordId: number
  followRecordId: number
  allCleared: boolean
}

@Table({
  modelName: 'twitterTaskRecord',
  indexes: [],
})
export default class TwitterTaskRecord extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  get userId(): number {
    return this.getDataValue('userId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(50))
  get tweetId(): string {
    return this.getDataValue('tweetId')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get likeRecordId(): number {
    return this.getDataValue('likeRecordId')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get retweetRecordId(): number {
    return this.getDataValue('retweetRecordId')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get followRecordId(): number {
    return this.getDataValue('followRecordId')
  }

  @BelongsTo(() => User)
  get user(): User | undefined {
    return this.getDataValue('user')
  }

  set user(user: User | undefined) {
    //
  }

  get allCleared(): boolean {
    return this.likeRecordId > 0 && this.retweetRecordId > 0
  }

  static async findOrCreateTaskRecord(user: User): Promise<TwitterTaskRecord> {
    const exsit = await TwitterTaskRecord.findOne({
      where: {
        userId: user.id,
      },
    })
    if (exsit) {
      return exsit
    }
    const tweetId = await Constant.get('taskTweetId')
    if (!tweetId) {
      throw new Error('taskTweetId not set')
    }
    return await TwitterTaskRecord.create({
      userId: user.id,
      tweetId,
    })
  }

  getData(): TwitterTaskRecordData {
    return {
      likeRecordId: this.likeRecordId,
      retweetRecordId: this.retweetRecordId,
      followRecordId: this.followRecordId,
      allCleared: this.allCleared,
    }
  }
}

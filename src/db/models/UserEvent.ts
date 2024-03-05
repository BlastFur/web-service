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

export interface UserEventData {
  points: number
}

@Table({
  modelName: 'userEvent',
  indexes: [],
})
export default class UserEvent extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  get userId(): number {
    return this.getDataValue('userId')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get points(): number {
    return this.getDataValue('points')
  }

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  get adjustment(): number {
    return this.getDataValue('adjustment')
  }

  @AllowNull(true)
  @Default(null)
  @Column(DataType.INTEGER)
  get display(): number {
    return this.getDataValue('display')
  }

  getPoints(): number {
    if (this.display) return this.display
    return this.points + this.adjustment
  }

  getData(): UserEventData {
    return {
      points: this.getPoints(),
    }
  }

  static async findOrCreateUserEvent(user: User): Promise<UserEvent> {
    return await UserEvent.findOrCreateUserEventByUserId(user.id)
  }

  static async findOrCreateUserEventByUserId(
    userId: number
  ): Promise<UserEvent> {
    const exsit = await UserEvent.findOne({
      where: {
        userId,
      },
    })
    if (exsit) {
      return exsit
    }
    return await UserEvent.create({
      userId,
    })
  }
}

@Table({
  modelName: 'event',
  indexes: [
    {
      fields: ['code'],
      unique: true,
    },
  ],
})
export class Event extends Model {
  @AllowNull(false)
  @Default(0)
  @Column(DataType.CHAR(50))
  get code(): number {
    return this.getDataValue('code')
  }

  @AllowNull(false)
  @Column(DataType.INTEGER)
  get points(): number {
    return this.getDataValue('points')
  }
}

@Table({
  modelName: 'userEventMap',
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['eventId'],
    },
  ],
})
export class UserEventMap extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  get userId(): number {
    return this.getDataValue('userId')
  }

  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Event)
  get eventId(): number {
    return this.getDataValue('eventId')
  }

  @AllowNull(false)
  @Column(DataType.INTEGER)
  get points(): number {
    return this.getDataValue('points')
  }

  @AllowNull(true)
  @Column(DataType.JSON)
  get data(): any {
    return this.getDataValue('data')
  }

  @BelongsTo(() => User)
  get user(): User | undefined {
    return this.getDataValue('user')
  }

  set user(user: User | undefined) {
    //
  }

  @BelongsTo(() => Event)
  get event(): Event | undefined {
    return this.getDataValue('event')
  }

  set event(event: Event | undefined) {
    //
  }

  static async findByUserIdEventCode(
    userId: number,
    eventCode: string
  ): Promise<UserEventMap[]> {
    const event = await Event.findOne({
      where: {
        code: eventCode,
      },
    })
    if (!event) {
      throw new Error('event not found')
    }
    return await UserEventMap.findAll({
      where: {
        userId: userId,
        eventId: event.id,
      },
    })
  }

  static async pushEvent(
    userId: number,
    eventCode: string,
    points?: number
  ): Promise<void> {
    const event = await Event.findOne({
      where: {
        code: eventCode,
      },
    })
    if (!event) {
      throw new Error('event not found')
    }
    await UserEventMap.sequelize!.transaction(async (transaction) => {
      await UserEventMap.create(
        {
          userId: userId,
          eventId: event.id,
          points: points ?? event.points,
        },
        {
          transaction,
        }
      )
      const userEvent = await UserEvent.findOrCreateUserEventByUserId(userId)
      await userEvent.increment('points', { by: event.points, transaction })
    })
  }
}

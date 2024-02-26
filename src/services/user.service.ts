import { User } from '../db/models'
import TwitterTaskRecord, {
  TwitterTaskRecordData,
} from '../db/models/TwitterTaskRecord'
import socialSerivceHelper from './SocialSerivceHelper'
import {
  TwitterUserInfo,
  UserAllData,
  UserWalletData,
  WalletSignRequestData,
  WalletSignVerifyPayload,
} from './SocialSerivceHelper/types'
import { GenerateJWTTokenPayload, generateJWTToken } from './utils'

export async function fetchWalletSignRequest(
  address: string,
  domain: string,
  uri: string
): Promise<WalletSignRequestData> {
  return await socialSerivceHelper.fetchWalletSignRequest({
    address,
    domain,
    uri,
  })
}

export async function login(
  payload: WalletSignVerifyPayload
): Promise<GenerateJWTTokenPayload> {
  const user = await User.findByUuid(payload.request.address)
  if (!user) {
    throw new Error('user not found')
  }
  const result = await socialSerivceHelper.verifyWalletSign(payload)
  if (result.address.toLocaleLowerCase() === user.address.toLocaleLowerCase()) {
    return {
      user,
      expirationTime: result.expirationTime,
    }
  }
  throw new Error('login verify failed')
}

export async function signup(
  payload: WalletSignVerifyPayload
): Promise<GenerateJWTTokenPayload> {
  const user = await User.findByUuid(payload.request.address)
  if (user) {
    throw new Error('user already exists')
  }
  const result = await socialSerivceHelper.verifyWalletSign(payload)
  const userCreated = await User.create({
    // temp address
    address: `0xtemp_${new Date().getTime().toString()}`,
  })
  const signupResult = await socialSerivceHelper.upsertUserWallet(
    userCreated.id.toString(),
    {
      address: result.address,
      isSignup: true,
    }
  )

  userCreated.setDataValue('address', signupResult.address)
  await userCreated.save()

  return {
    user: userCreated,
    expirationTime: result.expirationTime,
  }
}

export interface UserData {
  wallet: Omit<UserWalletData, 'applicationId' | 'userKey'>
  twitter: TwitterUserInfo | null
}

export async function fetchAllData(userKey: string): Promise<UserData> {
  const data = await socialSerivceHelper.fetchAllData(userKey)
  if (!data.wallets[0]) {
    throw new Error('user wallet not found')
  }
  return {
    wallet: {
      type: data.wallets[0].type,
      address: data.wallets[0].address,
      isSignup: data.wallets[0].isSignup,
      memo: data.wallets[0].memo,
      extra: data.wallets[0].extra,
    },
    twitter: data.twitter,
  }
}

export async function fetchUserTwitterAuthUrl(user: User): Promise<string> {
  const data = await socialSerivceHelper.fetchUserTwitterAuthUrl(
    (user.id as number).toString()
  )
  return data
}

export async function userTwitterBindCallback(
  state: string,
  code: string
): Promise<TwitterUserInfo> {
  const data = await socialSerivceHelper.twitterBindCallback(state, code)
  return data
}

export async function userTwitterTaskInfo(
  user: User
): Promise<TwitterTaskRecordData> {
  const record = await TwitterTaskRecord.findOrCreateTaskRecord(user)
  return record.getData()
}

export async function userTwitterTaskCheckLike(
  user: User
): Promise<TwitterTaskRecordData> {
  const record = await TwitterTaskRecord.findOrCreateTaskRecord(user)
  if (record.likeRecordId > 0) {
    return record.getData()
  }
  const data = await socialSerivceHelper.checkTweetLike(
    (user.id as number).toString(),
    record.tweetId
  )
  record.setDataValue('likeRecordId', data)
  await record.save()
  return record.getData()
}

export async function userTwitterTaskCheckRetweet(
  user: User
): Promise<TwitterTaskRecordData> {
  const record = await TwitterTaskRecord.findOrCreateTaskRecord(user)
  if (record.retweetRecordId > 0) {
    return record.getData()
  }
  const data = await socialSerivceHelper.checkTweetRetweet(
    (user.id as number).toString(),
    record.tweetId
  )
  record.setDataValue('retweetRecordId', data)
  await record.save()
  return record.getData()
}

const userServices = {
  fetchWalletSignRequest,
  login,
  signup,
  fetchAllData,
  fetchUserTwitterAuthUrl,
  userTwitterBindCallback,
  userTwitterTaskInfo,
  userTwitterTaskCheckLike,
  userTwitterTaskCheckRetweet,
}

export default userServices

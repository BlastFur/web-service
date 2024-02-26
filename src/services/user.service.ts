import { User } from '../db/models'
import socialSerivceHelper from './SocialSerivceHelper'
import {
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

const userServices = {
  fetchWalletSignRequest,
  login,
  signup,
}

export default userServices

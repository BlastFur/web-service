export type UserWalletType = 'evm'

export interface ApplicationUserQuery {
  // applicationId: number
  userKey: string
}

export interface WalletSignRequestPayload {
  type: UserWalletType
  address: string
  domain: string
  uri: string
  chainId: number
  version?: string
  applicationQuery?: ApplicationUserQuery
}

export interface WalletSignRequestData {
  address: string
  nonce: string
  message: string
  type: UserWalletType
}

export interface WalletSignVerifyPayload {
  request: WalletSignRequestData
  signature: string
  applicationQuery?: ApplicationUserQuery
  data?: any
}

export interface WalletSignVerifyResult {
  address: string
  expirationTime?: string
}

export interface UpsertUserWalletPayload {
  address: string
  isSignup: boolean
}

export interface UserWalletData {
  userKey: string
  type: UserWalletType
  address: string
  isSignup: boolean
  memo: string | null
  extra: any | null
}

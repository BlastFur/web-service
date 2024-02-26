import axios, { AxiosInstance } from 'axios'
import {
  SOCIAL_SERVICE,
  SOCIAL_SERVICE_APIKEY,
  SOCIAL_SERVICE_WALLET_CHAIN_ID,
} from '../../constants'
import {
  UpsertUserWalletPayload,
  UserAllData,
  UserWalletData,
  WalletSignRequestData,
  WalletSignRequestPayload,
  WalletSignVerifyPayload,
  WalletSignVerifyResult,
} from './types'
import { JsonResponseData } from '../../middleware/jsonResponse.middleware'

export default class SocialSerivceHelper {
  axios: AxiosInstance

  constructor() {
    this.axios = axios.create({
      baseURL: SOCIAL_SERVICE,
      headers: {
        'x-api-key': SOCIAL_SERVICE_APIKEY,
      },
    })
    this.axios.interceptors.response.use(
      (res) => {
        return res
      },
      async (err) => {
        if (err.response) {
          const response = err.response
          if (response.data?.error?.message) {
            throw new Error(response.data.error.message)
          }
        }
        return await Promise.reject(err)
      }
    )
  }

  private parseResult<T = any>(data: JsonResponseData<T>): T {
    if (data.success) {
      return data.data!
    }
    if (data.error) {
      throw new Error(data.error.message)
    }
    throw new Error('fetch error with no error message')
  }

  // wallets
  async fetchWalletSignRequest(
    payload: Omit<WalletSignRequestPayload, 'chainId' | 'type'>
  ): Promise<WalletSignRequestData> {
    const resp = await this.axios.post('/api/v1/wallet/sign/request', {
      ...payload,
      type: 'evm',
      chainId: SOCIAL_SERVICE_WALLET_CHAIN_ID,
    })
    return await this.parseResult(resp.data)
  }

  async verifyWalletSign(
    payload: WalletSignVerifyPayload
  ): Promise<WalletSignVerifyResult> {
    const resp = await this.axios.post('/api/v1/wallet/sign/verify', payload)
    return await this.parseResult(resp.data)
  }

  async upsertUserWallet(
    userKey: string,
    payload: UpsertUserWalletPayload
  ): Promise<UserWalletData> {
    const resp = await this.axios.post(`/api/v1/wallet/user/${userKey}`, {
      ...payload,
      type: 'evm',
    })
    if (resp.data.applicationId) {
      delete resp.data.applicationId
    }
    return await this.parseResult(resp.data)
  }

  // users
  async fetchAllData(userKey: string): Promise<UserAllData> {
    const resp = await this.axios.get(`/api/v1/user/${userKey}`)
    return await this.parseResult(resp.data)
  }
}

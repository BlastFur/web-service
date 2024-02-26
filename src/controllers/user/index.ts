import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import userServices from '../../services/user.service'
import {
  WalletSignRequestData,
  WalletSignRequestPayload,
  WalletSignVerifyPayload,
  WalletSignVerifyResult,
} from '../../services/SocialSerivceHelper/types'
import { generateJWTToken } from '../../services/utils'

export default class UserController implements Controller {
  public path = '/api/v1/user'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      '/sign_request',
      jsonResponseMiddleware,
      this.signRequest as RequestHandler
    )
    this.router.post(
      '/signup',
      jsonResponseMiddleware,
      this.signup as RequestHandler
    )
    this.router.post(
      '/login',
      jsonResponseMiddleware,
      this.login as RequestHandler
    )
    // this.router.get(
    //   '/:userKey/wallets',
    //   apiKeyMiddleware(),
    //   jsonResponseMiddleware,
    //   this.wallets as RequestHandler
    // )
    // this.router.get(
    //   '/:userKey/twitter',
    //   apiKeyMiddleware(),
    //   jsonResponseMiddleware,
    //   this.twitter as RequestHandler
    // )
  }

  private signRequest(
    request: Request<
      any,
      any,
      Omit<WalletSignRequestPayload, 'chainId' | 'type'>
    >,
    response: JsonResponse<WalletSignRequestData>,
    next: NextFunction
  ): void {
    const { address, domain, uri } = request.body
    userServices
      .fetchWalletSignRequest(address, domain, uri)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1000)
      })
  }

  private signup(
    request: Request<any, any, WalletSignVerifyPayload>,
    response: JsonResponse<{ token: string }>,
    next: NextFunction
  ): void {
    userServices
      .signup(request.body)
      .then((payload) => {
        const token = generateJWTToken(request, payload)
        response.jsonSuccess({ token }, token)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1001)
      })
  }

  private login(
    request: Request<any, any, WalletSignVerifyPayload>,
    response: JsonResponse<{ token: string }>,
    next: NextFunction
  ): void {
    userServices
      .login(request.body)
      .then((payload) => {
        const token = generateJWTToken(request, payload)
        response.jsonSuccess({ token }, token)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1001)
      })
  }

  // private allData(
  //   request: Request<{ userKey: string }>,
  //   response: JsonResponse<UserAllData>,
  //   next: NextFunction
  // ): void {
  //   const { userKey } = request.params
  //   const { authApplication } = request as unknown as ApplicationRequest
  //   Promise.all([
  //     walletService.getUserWallets(authApplication.id, userKey),
  //     twitterServices.getUserTwitterInfo(authApplication.id, userKey),
  //   ])
  //     .then(([wallets, twitter]) => {
  //       response.jsonSuccess({
  //         wallets: wallets.map((wallet) => wallet.getData()),
  //         twitter,
  //       })
  //     })
  //     .catch((error) => {
  //       response.status(500).jsonError(error.message, 3000)
  //     })
  // }

  // private wallets(
  //   request: Request<{ userKey: string }>,
  //   response: JsonResponse<UserWalletData[]>,
  //   next: NextFunction
  // ): void {
  //   const { userKey } = request.params
  //   const { authApplication } = request as unknown as ApplicationRequest
  //   walletService
  //     .getUserWallets(authApplication.id, userKey)
  //     .then((data) => {
  //       response.jsonSuccess(data.map((wallet) => wallet.getData()))
  //     })
  //     .catch((error) => {
  //       response.status(500).jsonError(error.message, 3001)
  //     })
  // }

  // private twitter(
  //   request: Request<{ userKey: string }>,
  //   response: JsonResponse<TwitterUserInfo | null>,
  //   next: NextFunction
  // ): void {
  //   const { userKey } = request.params
  //   const { authApplication } = request as unknown as ApplicationRequest
  //   twitterServices
  //     .getUserTwitterInfo(authApplication.id, userKey)
  //     .then((data) => {
  //       response.jsonSuccess(data)
  //     })
  //     .catch((error) => {
  //       response.status(500).jsonError(error.message, 3002)
  //     })
  // }
}

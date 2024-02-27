import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import userServices, { UserData } from '../../services/user.service'
import {
  UserAllData,
  WalletSignRequestData,
  WalletSignRequestPayload,
  WalletSignVerifyPayload,
  WalletSignVerifyResult,
} from '../../services/SocialSerivceHelper/types'
import { generateJWTToken } from '../../services/utils'
import jwtMiddleware, { JWTRequest } from '../../middleware/jwt.middleware'
import { TwitterTaskRecordData } from '../../db/models/TwitterTaskRecord'

interface TwitterBindCallbackQuery {
  state: string
  code: string
}

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
    this.router.get(
      '/my_info',
      jwtMiddleware(),
      jsonResponseMiddleware,
      this.myInfo as RequestHandler
    )
    this.router.get(
      '/twitter/auth_url',
      jwtMiddleware(),
      jsonResponseMiddleware,
      this.twitterAuthUrl as RequestHandler
    )
    this.router.get(
      '/twitter/bind_callback',
      jsonResponseMiddleware,
      this.twitterBindCallback as unknown as RequestHandler
    )
    this.router.get(
      '/twitter/task/info',
      jwtMiddleware(),
      jsonResponseMiddleware,
      this.twitterTaskInfo as unknown as RequestHandler
    )
    this.router.get(
      '/twitter/task/check_like',
      jwtMiddleware(),
      jsonResponseMiddleware,
      this.twitterTaskCheckLike as unknown as RequestHandler
    )
    this.router.get(
      '/twitter/task/check_retweet',
      jwtMiddleware(),
      jsonResponseMiddleware,
      this.twitterTaskCheckRetweet as unknown as RequestHandler
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
        response.status(500).jsonError(error.message, 1002)
      })
  }

  private myInfo(
    request: Request,
    response: JsonResponse<UserData>,
    next: NextFunction
  ): void {
    const { authUser } = request as unknown as JWTRequest
    userServices
      .fetchAllData(authUser)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1003)
      })
  }

  private twitterAuthUrl(
    request: Request,
    response: JsonResponse<string>,
    next: NextFunction
  ): void {
    const { authUser } = request as unknown as JWTRequest
    userServices
      .fetchUserTwitterAuthUrl(authUser)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1004)
      })
  }

  private twitterBindCallback(
    request: Request<any, any, any, TwitterBindCallbackQuery>,
    response: JsonResponse<UserData>,
    next: NextFunction
  ): void {
    const { state, code } = request.query
    userServices
      .userTwitterBindCallback(state, code)
      .then(() => {
        response.render('autoclose')
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1005)
      })
  }

  private twitterTaskInfo(
    request: Request,
    response: JsonResponse<TwitterTaskRecordData>,
    next: NextFunction
  ): void {
    const { authUser } = request as unknown as JWTRequest
    userServices
      .userTwitterTaskInfo(authUser)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1003)
      })
  }

  private twitterTaskCheckLike(
    request: Request,
    response: JsonResponse<TwitterTaskRecordData>,
    next: NextFunction
  ): void {
    const { authUser } = request as unknown as JWTRequest
    userServices
      .userTwitterTaskCheckLike(authUser)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1003)
      })
  }

  private twitterTaskCheckRetweet(
    request: Request,
    response: JsonResponse<TwitterTaskRecordData>,
    next: NextFunction
  ): void {
    const { authUser } = request as unknown as JWTRequest
    userServices
      .userTwitterTaskCheckRetweet(authUser)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1003)
      })
  }

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

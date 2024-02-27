import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import { Constant } from '../../db/models'

interface ConstantsData {
  taskTweetId: string | null
}

export default class OtherController implements Controller {
  public path = '/api/v1/'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(
      '/constants',
      jsonResponseMiddleware,
      this.constants as RequestHandler
    )
  }

  private constants(
    request: Request,
    response: JsonResponse<ConstantsData>,
    next: NextFunction
  ): void {
    Promise.all([Constant.get('taskTweetId')])
      .then(([taskTweetId]) => {
        response.jsonSuccess({
          taskTweetId,
        })
      })
      .catch((e) => {
        response.status(500).jsonError(e.message, 2001)
      })
  }
}

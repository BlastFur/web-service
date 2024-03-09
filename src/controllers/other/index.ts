import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import { Constant } from '../../db/models'

interface ConstantsData {
  taskTweetId: string | null
  blastfurTwitterName: string | null
  blastfurTwitterFollowLink: string | null
  blastfurDiscordJoinLink: string | null
  initialPoints: number | null
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
    Promise.all([
      Constant.get('taskTweetId'),
      Constant.get('blastfurTwitterName'),
      Constant.get('blastfurTwitterFollowLink'),
      Constant.get('blastfurDiscordJoinLink'),
      Constant.get('initialPoints'),
    ])
      .then(
        ([
          taskTweetId,
          blastfurTwitterName,
          blastfurTwitterFollowLink,
          blastfurDiscordJoinLink,
          initialPoints,
        ]) => {
          response.jsonSuccess({
            taskTweetId,
            blastfurTwitterName,
            blastfurTwitterFollowLink,
            blastfurDiscordJoinLink,
            initialPoints,
          })
        }
      )
      .catch((e) => {
        response.status(500).jsonError(e.message, 2001)
      })
  }
}

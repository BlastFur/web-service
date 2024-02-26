import jwt from 'jwt-simple'
import { Request } from 'express'
import { JWTContent } from '../middleware/jwt.middleware'
import { User } from '../db/models'

export interface GenerateJWTTokenPayload {
  user: User
  expirationTime?: number | string
}

export function generateJWTToken(
  request: Request,
  payload: GenerateJWTTokenPayload
): string {
  const { user, expirationTime } = payload
  const obj: JWTContent = {
    exp: expirationTime
      ? new Date(expirationTime).getTime()
      : new Date().getTime() + 1000 * 60 * 60 * 24 * 7,
    // exp: new Date().getTime() + 1000 * 60 * 1,
    uuid: user.address,
  }
  const token = jwt.encode(obj, request.app.get('jwtTokenSecret'))
  return token
}

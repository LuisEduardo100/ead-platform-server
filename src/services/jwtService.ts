
import jwt from 'jsonwebtoken'
import { JWT_KEY } from '../config/environment.js'

const secret = JWT_KEY

export const jwtService = {
  signToken: (payload: string | object | Buffer, expiration: string) => {
    return jwt.sign(payload, secret, { expiresIn: expiration })
  },
  verifyToken: (token: string, callbackfn: jwt.VerifyCallback) => {
    jwt.verify(token, secret, callbackfn)
  }
}

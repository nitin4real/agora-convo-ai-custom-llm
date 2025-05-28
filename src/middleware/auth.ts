import { Request, Response, NextFunction } from 'express'
import { config } from '../libs/utils'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  // use jwt to verify the token
  try {
    const decoded = jwt.verify(token, config.jwtSecret)
    console.log('Decoded token:', decoded)
    req.body.userId = (decoded as JwtPayload)?.userId || ''
    req.body.appId = (decoded as JwtPayload)?.appId || ''

  } catch (error) {
    console.error('Error verifying token:', error)
    return res.status(403).json({ error: 'Invalid or missing token' })
  }

  next()
}

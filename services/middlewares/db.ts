import type { NextApiResponse } from 'next'
import { NextHandler } from 'next-connect'
import type { NextApiRequest } from 'next'
import { dbConnect } from '@/utils/db'
import mongoose from 'mongoose'

export interface DBRequest extends NextApiRequest {
    mongoose: typeof mongoose
}
export async function dbMiddleware(req: DBRequest, res: NextApiResponse, next: NextHandler) {
    req.mongoose = await dbConnect()
    await next()
}

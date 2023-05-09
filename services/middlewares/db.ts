import type { NextApiResponse } from 'next'
import { NextHandler } from 'next-connect'
import type { NextApiRequest } from 'next'
import { connectToDatabase } from '@/utils/db'
import mongoose from 'mongoose'

export interface DBRequest extends NextApiRequest {
    dbcon: mongoose.Connection
}
export async function dbMiddleware(req: DBRequest, res: NextApiResponse, next: NextHandler) {
    req.dbcon = await connectToDatabase()
    return next()
}

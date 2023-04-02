import mongoose from 'mongoose'
import type { NextApiRequest, NextApiResponse } from 'next'
import { NextHandler } from 'next-connect'

const connectionString = process.env.MONGO_URL || ''

async function connectToDatabase(): Promise<mongoose.Connection> {
    const connect = await mongoose.connect(connectionString)
    console.log('connect db success')
    return connect.connection
}

export interface DBRequest extends NextApiRequest {
    dbcon: mongoose.Connection
}

async function dbMiddleware(req: DBRequest, res: NextApiResponse, next: NextHandler) {
    req.dbcon = await connectToDatabase()
    return next()
}

export { connectToDatabase, dbMiddleware }

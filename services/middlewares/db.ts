import { NextHandler } from 'next-connect'
import { dbConnect } from '@/utils/db'
import mongoose from 'mongoose'
import { NextRequest } from 'next/server'

export interface DBRequest extends NextRequest {
    mongoose: typeof mongoose
}
export async function dbMiddleware(req: DBRequest, ctx: unknown, next: NextHandler) {
    req.mongoose = await dbConnect()
    return await next()
}

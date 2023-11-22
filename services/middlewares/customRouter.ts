import { ErrorData } from '@/types/server/common'
import { Boom, internal, isBoom } from '@hapi/boom'
import { createEdgeRouter } from 'next-connect'
import { NextRequest } from 'next/server'
import { NextResponse } from './edge'

/**
 * errno定义规范
 * 首位：A:客户端异常/B:服务端异常/C:第三方异常
 * 2-3位：
 * 01注册
 * 02登录
 * 03聊天列表
 * 04聊天交互
 * 05预设
 * 06AI
 * 99通用
 * 4-5位：从01自增
 */

// error handler in serverless functions
export const errorHandler = (err: unknown) => {
    // 如果是一个 Boom 异常，则根据 Boom 异常结构修改 `res`
    if (isBoom(err)) {
        return NextResponse.json(
            {
                errno: err.data?.errno || 'B0000',
                errmsg: err.data?.errmsg || err.message,
            },
            {
                status: err.output.payload.statusCode,
            }
        )
    } else {
        // unexcepted error
        console.error(err)
        return NextResponse.json(
            {
                errno: 'B0000',
                errmsg: '未知错误',
            },
            {
                status: 500,
            }
        )
    }
}

// serverless router creater with universal error handler
export function createCustomRouter<T extends NextRequest, P extends { params: unknown }>() {
    const router = createEdgeRouter<T, P>()
    const run = router.run.bind(router)
    router.run = (req: T, ctx: P): Promise<unknown> => {
        return run(req, ctx).catch((err) => {
            return errorHandler(err)
        })
    }
    return router
}

// trans to Boom error
export function toBoom(error: unknown, payload?: ErrorData): Boom | void {
    if (isBoom(error)) {
        return error
    } else {
        console.error(error)
        const boomError = payload ? internal<ErrorData>('', payload) : null
        if (boomError) {
            return boomError
        }
    }
}

// HOF make a function return or throw Boom error
export const tryOrBoom =
    <T extends (...args: any[]) => any>(fn: T, payload?: ErrorData) =>
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        try {
            return await fn(...args)
        } catch (error) {
            throw toBoom(error, payload)
        }
    }

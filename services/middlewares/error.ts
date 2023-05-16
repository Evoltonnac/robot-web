import { ErrorData } from '@/types/server/common'
import { Boom, internal, isBoom } from '@hapi/boom'
import { NextApiRequest, NextApiResponse } from 'next'
import { createRouter } from 'next-connect'

/**
 * errno定义规范
 * 首位：A:客户端异常/B:服务端异常/C:第三方异常
 * 2-3位：
 * 01注册
 * 02登录
 * 03聊天列表
 * 04聊天交互
 * 4-5位：从01自增
 */

// error handler in serverless functions
export const errorHandler = (err: unknown, req: NextApiRequest, res: NextApiResponse) => {
    // 如果是一个 Boom 异常，则根据 Boom 异常结构修改 `res`
    if (isBoom(err)) {
        res.status(err.output.payload.statusCode)
        res.json({
            errno: err.data?.errno || 'B0000',
            errmsg: err.data?.errmsg || err.message,
        })
        res.end()
    } else {
        // unexcepted error
        console.error(err)
        res.status(500)
        res.json({
            errno: 'B0000',
            errmsg: '未知错误',
        })
        res.end()
    }
}

// serverless router creater with universal error handler
export function createCustomRouter<T extends NextApiRequest, P extends NextApiResponse>() {
    const router = createRouter<T, P>()
    // extend json function
    router.use((req, res: NextApiResponse, next) => {
        const json = res.json.bind(res)
        res.json = (data) => {
            const { errno, errmsg, ...rest } = data
            json({
                errmsg,
                errno: errno || '00000',
                data: { ...rest },
            })
        }
        return next()
    })
    const handler = router.handler.bind(router)
    router.handler = () =>
        handler({
            onError: errorHandler,
        })
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

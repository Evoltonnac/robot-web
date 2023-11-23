import { ErrorData } from '@/types/server/common'
import { createEdgeRouter } from 'next-connect'
import { EdgeRouter } from 'next-connect/dist/types/edge'
import { NextResponse as NextOriResponse, NextRequest } from 'next/server'

export declare class CustomEdgeRouter<Req extends Request, Ctx = unknown> extends EdgeRouter<Req, Ctx> {
    run(req: Req, ctx: Ctx): Promise<void | Response>
}

/**
 * custom NextResponse class which override json method with data format logic
 */
export class NextResponse extends NextOriResponse {
    constructor(...args: any) {
        super(...args)
    }
    static json<JsonBody>(body: JsonBody, init?: ResponseInit): NextOriResponse<JsonBody> {
        if (Object.prototype.toString.call(body) !== '[object Object]') {
            return super.json(
                {
                    errno: '00000',
                    data: body,
                } as JsonBody,
                init
            )
        }
        const { errno, errmsg, ...rest } = body as Record<string, unknown>
        return super.json(
            {
                errmsg,
                errno: errno || '00000',
                data: { ...rest },
            } as JsonBody,
            init
        )
    }
}

// error handler in edge functions
export const errorHandlerEdge = (err: unknown) => {
    console.error(err)
    const errorData: ErrorData = {
        errno: 'B0000',
        errmsg: '未知错误',
    }
    let statusCode = 500
    if (err instanceof Error) {
        try {
            const { errno, errmsg, status } = JSON.parse(err.message)
            errorData.errno = errno
            errorData.errmsg = errmsg
            statusCode = status
        } catch (e) {}
    }
    return NextResponse.json(errorData, {
        status: statusCode,
    })
}

// serverless router creater with universal error handler
export function createCustomEdgeRouter<T extends NextRequest, P extends { params: unknown }>() {
    const router = createEdgeRouter<T, P>()
    const run = router.run.bind(router)
    router.run = (req: T, ctx: P): Promise<unknown> => {
        return run(req, ctx).catch((err) => {
            return errorHandlerEdge(err)
        })
    }
    return router as CustomEdgeRouter<T, P>
}

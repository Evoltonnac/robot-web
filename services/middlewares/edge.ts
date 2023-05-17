import { ErrorData } from '@/types/server/common'
import { NextResponse } from 'next/server'

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

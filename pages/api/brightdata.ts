/**
 * @file brightdata google search proxy api
 */
import type { NextApiResponse } from 'next'
import { createCustomRouter } from '@/services/middlewares/customRouter'
import { AuthRequest, authMiddleware } from '@/services/middlewares/auth'
import Boom from '@hapi/boom'
import { ErrorData } from '@/types/server/common'
import { parseGoogleSearch } from '@/utils/langchain'
import axios from 'axios'

const { BRIGHT_DATA_USERNAME, BRIGHT_DATA_PASSWORD } = process.env

const router = createCustomRouter<AuthRequest, NextApiResponse>()

router.use(authMiddleware).get(async (req, res) => {
    const { q, gl = '', hl = 'en' } = req.query
    if (!q) {
        throw Boom.internal<ErrorData>('query not exist', {
            errno: 'A9902',
            errmsg: '查询无效',
        })
    }
    if (!BRIGHT_DATA_USERNAME || !BRIGHT_DATA_PASSWORD) {
        throw Boom.internal<ErrorData>('brightdata username or password not exist', {
            errno: 'B9902',
            errmsg: '查询失败',
        })
    }

    const searchRes = await axios.get(
        parseGoogleSearch({
            q: q.toString(),
            gl: gl.toString(),
            hl: hl.toString(),
        }),
        {
            proxy: {
                protocol: 'http',
                host: 'brd.superproxy.io',
                port: 22225,
                auth: {
                    username: BRIGHT_DATA_USERNAME,
                    password: BRIGHT_DATA_PASSWORD,
                },
            },
        }
    )

    if (searchRes.status !== 200) {
        throw Boom.internal<ErrorData>('brightdata search error', {
            errno: 'C9902',
            errmsg: '查询失败',
        })
    }
    res.status(200).json(searchRes.data)
    res.end()
    return
})

export default router.handler()

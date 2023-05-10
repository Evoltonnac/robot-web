import type { NextApiRequest, NextApiResponse } from 'next'
import createRouter from 'next-connect'

const router = createRouter<NextApiRequest, NextApiResponse>()

router.get(async (req, res) => {
    res.status(200).json({ data: 'success' })
})

export default router

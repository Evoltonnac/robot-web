import type { NextApiRequest, NextApiResponse } from 'next'

const handler = (req: NextApiRequest, res: NextApiResponse) => {
    // res.send("Hello, World!")
    // res.status(500).json({message: "Something went wrong!"})
    res.json({ message: 'Hello, World!' })
    res.end()
}
export default handler

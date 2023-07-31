const { DOMAIN = 'robot-web-app.vercel.app' } = process.env

export const HOSTNAME = new URL(`https://${DOMAIN}`).hostname

// max messages to chat
export const MAX_ROUNDS = 20

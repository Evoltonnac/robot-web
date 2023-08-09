const { DOMAIN = 'robot-web-app.vercel.app' } = process.env

const HOSTNAME = new URL(`https://${DOMAIN}`).hostname

// max messages to chat
const MAX_ROUNDS = 20

export { HOSTNAME, MAX_ROUNDS }

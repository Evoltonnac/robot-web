const { DOMAIN = '' } = process.env

const HOSTNAME = DOMAIN ? new URL(`https://${DOMAIN}`).hostname : 'localhost'

// max messages to chat
const MAX_ROUNDS = 20

export { HOSTNAME, MAX_ROUNDS }

import mongoose from 'mongoose'

const connectionString = process.env.MONGODB_URI || ''

async function connectToDatabase(): Promise<mongoose.Connection> {
    console.log('connect db start ' + Date.now())
    const connect = await mongoose.connect(connectionString)
    console.log('connect db success ' + Date.now())
    return connect.connection
}

export { connectToDatabase }

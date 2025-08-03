import { userStates } from './model/state';
import { setupWebSocket } from './src/websocket';
import { connect } from "mongoose"

await connect(process.env.MONGO_URL!)

const users = await userStates.find({ login: { $exists: true } })

for (const user of users) {
    setupWebSocket(user.login)
}
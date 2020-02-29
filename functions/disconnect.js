const { Connection } = require('../libs/connections')

let connection
const host = process.env.REDIS_HOST
const port = process.env.REDIS_PORT
const password = process.env.REDIS_PASSWORD

exports.handler = async (event, context, callback) => {
  if (!connection) {
    connection = new Connection({ host, port, password })
    connection.init(event)
  }

  await connection.removeConnection('myRoom', event.requestContext.connectionId)
  await connection.publish('myRoom', event, `${event.requestContext.connectionId} left the room.`)
  return { statusCode: 200 }
}

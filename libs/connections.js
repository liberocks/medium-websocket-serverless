const AWS = require('aws-sdk')
const redis = require('async-redis')

export class Connection {
  constructor (params = {}) {
    this.host = params.host
    this.port = parseInt(params.port)
    this.password = params.password
  }

  init (event) {
    this.client = redis.createClient({
      host: this.host,
      port: this.port,
      password: this.password
    })

    this.gateway = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
    })
  }

  addConnection (key, connectionId) {
    return this.client.sadd(key, connectionId)
  }

  removeConnection (key, connectionId) {
    return this.client.srem(key, connectionId)
  }

  getConnections (key) {
    return this.client.smembers(key)
  }

  async publish (key, event, message = null) {
    if (!message) message = event.body
    const connections = await this.getConnections(key)

    for (const connectionId of connections) {
      if (event.requestContext.connectionId === connectionId) continue
      try {
        await this.gateway.postToConnection({ ConnectionId: connectionId, Data: message }).promise()
      } catch (e) {
        this.removeConnection(connectionId)
      }
    }
  }
}

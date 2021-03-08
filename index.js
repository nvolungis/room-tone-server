const express = require('express')
const WebSocket = require('ws')
const routes = require('./routes')
const Methods = require('./methods')
const { generateError, normalizePort, safeParseJSON } = require('./helpers')

const app = express()

Object.keys(routes).forEach(key => {
  app.use(`/${key}`, routes[key])
})

app.use((req, res) => {
  return res.status(404).json(
    generateError({
      error: 'Not Found',
      reasons: [
        {
          reason: 'invalid_path',
          message: 'The requested path could not be found',
          data: req.path,
          location: 'path'
        }
      ]
    })
  )
})

const server = app.listen(process.env.WEB_PORT || 3000, () =>
  console.log(
    `Express Server is now listening on PORT: ${server.address().port}`
  )
)



const WSS = new WebSocket.Server({ server })

WSS.on('listening', () => {
  console.log(
    `WebSocket Server is now listening on PORT: ${WSS.address().port}`
  )
})

WSS.on('connection', ws => {
  ws.on('message', message => {
    const data = safeParseJSON(message)

    if (data === null) {
      ws.send(
        JSON.stringify(
          generateError({
            error: 'Parse Error',
            reasons: [
              {
                reason: 'invalid_message_data',
                message: 'Unable to parse the message contents',
                data: message,
                location: 'websocket-message'
              }
            ]
          })
        )
      )
    } else if (typeof data.method === 'string' && Methods[data.method]) {
      Methods[data.method](WSS, ws, data)
    } else {
      ws.send(
        JSON.stringify(
          generateError({
            error: 'Method Not Found',
            reasons: [
              {
                reason: 'invalid_method',
                message: 'Unable to find matching method',
                data: data.method,
                location: 'method'
              }
            ]
          })
        )
      )
    }
  })
})


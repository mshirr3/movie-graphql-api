import { ApolloServer } from '@apollo/server'
import express from 'express'
import { expressMiddleware } from '@apollo/server/express4'
import typeDefs from './schema.js'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
  })

  await server.start()

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return { user: null }
      },
    })
  )

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}/graphql`)
  )
}

startServer()

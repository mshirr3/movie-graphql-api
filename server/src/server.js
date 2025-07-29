import { ApolloServer } from '@apollo/server'
import express from 'express'
import { expressMiddleware } from '@apollo/server/express4'
import typeDefs from './schema.js'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import resolvers from './resolvers.js'
import dotenv from 'dotenv'

const app = express()

async function startServer() {
  dotenv.config()
  // mongodb setup
  mongoose.connect("mongodb://localhost:27017/moviedb")
  const db = mongoose.connection
  db.once('open', () => console.log('connected to Mongodb'))

  const server = new ApolloServer({
    typeDefs,
    resolvers
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

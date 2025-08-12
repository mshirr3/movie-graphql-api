import { ApolloServer } from '@apollo/server'
import express from 'express'
import { expressMiddleware } from '@apollo/server/express4'
import typeDefs from './schema.js'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import resolvers from './resolvers.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

const app = express()

async function startServer() {
  dotenv.config()
  // mongodb setup
  mongoose.connect("mongodb://localhost:27017/moviedb")
  const db = mongoose.connection
  db.once('open', () => console.log('connected to Mongodb'))

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      if (process.env.NODE_ENV === 'production') {
        return {
          message: err.message,
          code: err.extensions?.code || 'INTERNAL_SERVER_ERROR'
        }
      }
      return err
    }
  })

  await server.start()

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization || ''
        const token = auth.split(' ')[1] // cause bearer token

        try {
          if (token) {
            const user = jwt.verify(token, process.env.JWT_SECRET)
            return { user }
          }
        } catch (error) {
          console.log('invalid token')
        }
        // no user if token is invalid
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

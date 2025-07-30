import { GraphQLError } from 'graphql'
import Movie from './models/movie.js'

const resolvers = {
    Query: {
        // returns an array of movies
         movies: async (_, { genre, release_year }) => {
            try {
              const filter = {}
              if (genre) { filter.genre = genre}
              if (release_year) {filter.release_year = release_year}
              return await Movie.find(filter)
            } catch (error) {
                throw new GraphQLError('Failed to fetch movies', {
                    extensions: {code: 'INTERNAL_SERVER_ERROR',error: error.message }
                })
            }
        },
         movie: async (_, { id }) => {
            try {
              const movie = await Movie.findOne({id})
              if (!movie) {
                throw new GraphQLError('Movie not found', {
                    extensions: {
                        code:'NOT_FOUND',
                        http: { status: 404 }
                    }
                })
            }
              return movie
            } catch (error) {
              throw new GraphQLError('Failed to fetch movie', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                    error: error.message
                }
            })
        }
         }
    }
}

export default resolvers
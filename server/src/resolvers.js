import { GraphQLError } from 'graphql'
import Movie from './models/movie.js'
import Rating from './models/rating.js'
const resolvers = {
    Query: {
        // returns an array of movies
        movies: async (_, { genre, release_year }) => {
            try {
                const filter = {}
                if (genre) { filter.genre = genre }
                if (release_year) { filter.release_year = release_year }
                return await Movie.find(filter)
            } catch (error) {
                if (err instanceof GraphQLError) throw err
                throw new GraphQLError('Failed to fetch movies', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR', error: error.message }
                })
            }
        },
        movie: async (_, { id }) => {
            try {
                const movie = await Movie.findOne({ id })
                if (!movie) {
                    throw new GraphQLError('Movie not found', {
                        extensions: {
                            code: 'NOT_FOUND',
                            http: { status: 404 }
                        }
                    })
                }
                return movie
            } catch (error) {
                if (error instanceof GraphQLError) throw error
                throw new GraphQLError('Failed to fetch movie', {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        error: error.message
                    }
                })
            }
        },
        ratings: async (_, { movieId }) => {
            try {
                const ratings = await Rating.find({ movieId })
                if (ratings.length == 0) {
                    throw new GraphQLError('No ratings for this movie was found', {
                        extensions: {
                            code: 'NOT_FOUND',
                            http: { status: 404 }
                        }
                    })
                }
                return ratings
            } catch (err) {
                if (err instanceof GraphQLError) throw err
                throw new GraphQLError('Failed to fetch ratings', {
                        extensions: {
                            code: 'INTERNAL_SERVER_ERROR',
                            http: { status: 500 }
                        }
                    })
            }
        }
    },
    Movie: {
        ratings: async (parent) => {
            try {
               const ratings = await Rating.find({movieId: parent.id})
            if (!ratings || ratings.length == 0) {
                throw new GraphQLError('No ratings for this movie was found', {
                        extensions: {
                            code: 'NOT_FOUND',
                            http: { status: 404 }
                        }
                    })
            }
            return ratings 
            } catch (error) {
                if (error instanceof GraphQLError) throw error
                throw new GraphQLError('Failed to fetch ratings', {
                        extensions: {
                            code: 'INTERNAL_SERVER_ERROR',
                            http: { status: 500 }
                        }
                    })
            }
        }
    }
}

export default resolvers
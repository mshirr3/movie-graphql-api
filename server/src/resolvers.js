import { GraphQLError } from 'graphql'
import Movie from './models/movie.js'
import Rating from './models/rating.js'
import User from './models/user.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import Actor from './models/actor.js'
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
                const movie = await Movie.findById(id)
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
        actors: async () => {
            try {
               return await Actor.find()
            } catch (error) {
                throw error
            }
            
        },
        ratings: async (_, { movieId }) => {
            try {
                return await Rating.find({ movieId })
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
    Mutation: {
        register: async (_, { username, password }) => {
            const existingUser = await User.findOne({ username })
            if (existingUser) {
                throw new GraphQLError('Username already taken', {
                    extensions: {
                        code: 'BAD_USER_INPU',
                        http: { status: 400 }
                    }
                })
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const user = new User({ username, passwordHash })
            await user.save()
            return 'User registered successully'
        },
        login: async (_, { username, password }) => {
            dotenv.config()
            const user = await User.findOne({ username })
            if (!user) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                })
            }

            const valid = await bcrypt.compare(password, user.passwordHash)
            if (!valid) {
                throw new GraphQLError('Invalid credentials', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                })
            }

            const token = jwt.sign(
                { id: user._id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            )

            return token
        },
        addMovie: async (_, { title, release_year, genre }, context) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                })
            }
            const movie = new Movie({ title, release_year, genre })
            return await movie.save()
        },
        updateMovie: async (_, {id, title, release_year,genre}, context) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                })
            }
            return await Movie.findByIdAndUpdate(id, {title,release_year, genre}, {new: true})
        },
        deleteMovie: async (_, {id}, context) => {
            if (!context.user) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                })
            }
            return await Movie.findByIdAndDelete(id)
        }
    },
    Movie: {
        ratings: async (parent) => {
            try {
                return await Rating.find({ movieId: parent.csvId })
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
    },
    Actor: {
        id: (actor) => actor._id.toString() // id resolves to mongo_id
    }
}

export default resolvers
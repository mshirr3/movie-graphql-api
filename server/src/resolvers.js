import Movie from './models/movie.js'

const resolvers = {
    Query: {
        // returns an array of movies
         movies: async (_, { genre, release_year }) => {
            const filter = {}
            if (genre) { filter.genre = genre}
            if (release_year) {filter.release_year = release_year}
            return await Movie.find(filter)
        }
    }
}

export default resolvers
import fs from 'fs'
import csv from 'csv-parser'
import mongoose from 'mongoose'
import Movie from './models/movie.js'
import Rating from './models/rating.js'
import Actor from './models/actor.js'
import dirtyJSON from 'dirty-json'

// mongodb setup
mongoose.connect("mongodb+srv://mohameddshire:1W7lcROe89ri57w3@apidesign.lakzulz.mongodb.net/?retryWrites=true&w=majority&appName=apidesign")

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
})

mongoose.connection.once('open', () => console.log('Connected to MongoDB'))

// Parse genres to only first genre
function parseGenre(str) {
    if (!str) return 'Unknown'
    try {
        const json = str.replace(/'/g, '"')
        const genres = JSON.parse(json)

        return genres.length > 0 ? genres[0].name : 'Unknown'
    } catch (e) {
        return 'Unknown'
    }
}

const movies = []
// read and insert movies
fs.createReadStream('data/movies_metadata.csv')
    .pipe(csv({ skiplines: 0 }))
    .on('data', (row) => {
        // filter out roes with missing title or id
        if (!row.id || !row.title) return

        const releaseYear = row.release_date?.split('-')[0]

        movies.push({
            csvId: row.id,
            title: row.title,
            // make sure its Int
            release_year: releaseYear ? parseInt(releaseYear) : null,
            genre: parseGenre(row.genres),
            description: row.overview || ''
        })
    })
    .on('end', async () => {
        console.log(`Parsed ${movies.length} movies. Inserting into mongodb`)

        try {
            // clean db if populated
            await Movie.deleteMany({})
            await Movie.insertMany(movies)
            console.log('Movies inserted success')
        } catch (error) {
            console.error('failes to insert', error)
        }
    })

const ratings = []
fs.createReadStream('data/ratings_small.csv')
    .pipe(csv({ skiplines: 0 }))
    .on('data', (data) => {
        ratings.push({
            movieId: data.movieId,
            text: data.rating
        })
    })
    .on('end', async () => {
        try {
            await Rating.deleteMany({})
            await Rating.insertMany(ratings)
            console.log('Ratings data imported succesfully')
            mongoose.connection.close()
        } catch (error) {
            console.error('Error inserting data', error)
        }
    })



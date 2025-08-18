import fs from 'fs'
import csv from 'csv-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from './models/movie.js'
import Rating from './models/rating.js'
import Actor from './models/actor.js'
import dirtyJSON from 'dirty-json'

dotenv.config()
// mongodb setup
console.log(process.env.DB_CONNECTION_STRING)
mongoose.connect('mongodb://localhost:27017/moviedb')
const db = mongoose.connection
db.once('open', () => console.log('connected to Mongodb'))

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
            process.exit(0)
        } catch (error) {
            console.error('Error inserting data', error)
            process.exit(1)
        }
    })

    // map to ensure each actor has one doc only
const actorMap = new Map()

fs.createReadStream('data/credits.csv')
    .pipe(csv())
    .on('data', async (row) => {
        try {
           
            // parsing with dirty json library
            const cast = dirtyJSON.parse(row.cast)

            // find the movie in mongodb, movie schema
            const movie = await Movie.findOne({title:row.title})
            if (!movie) return // skip if movie not found

            for (const actor of cast) {
                await Actor.updateOne(
                    {name: actor.name}, // to prevent duplicates
                    {
                        $setOnInsert: { name: actor.name},
                        $addToSet: {movies_played: movie._id}
                    },
                    {upsert:true}
                )
            }
        } catch (error) {
            console.error(`error parsing actors for movie ${row.id}`, error.message)
        }
    })
    .on('end', () => {
        console.log('finished seeding actors')
        mongoose.connection.close()
    })
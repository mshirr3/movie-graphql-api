import fs from 'fs'
import csv from 'csv-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Movie from './models/movie.js'

dotenv.config()
// mongodb setup
mongoose.connect(process.env.DB_CONNECTION_STRING)
const db = mongoose.connection
db.once('open', () => console.log('connected to Mongodb'))

// Parse genres to only first genre
function parseGenre(str) {
    if(!str) return 'Unknown'
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
fs.createReadStream('server/src/data/movies_metadata.csv')
    .pipe(csv({ skiplines: 0 }))
    .on('data', (row) => {
        // filter out roes with missing title or id
        if (!row.id || !row.title) return

        const releaseYear = row.release_date?.split('-')[0]

        movies.push({
            id: row.id,
            title: row.title,
            // make sure its Int
            release_year: releaseYear ? parseInt(releaseYear): null,
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
        } finally {
            mongoose.connection.close()
        }
    })

const ratings = []
fs.createReadStream('server/src/data/ratins')
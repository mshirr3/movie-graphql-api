import mongoose from 'mongoose'

const movieSchema = new mongoose.Schema({
    csvId: String,
    title: String,
    release_year: Number,
    genre: String,
    description: String
})

export default mongoose.model('Movie', movieSchema)
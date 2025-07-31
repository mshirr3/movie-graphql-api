import mongoose from 'mongoose'

const ratingSchema = new mongoose.SCHEMA({
    movieId: String,
    text: String,
    movie: String
})

export default mongoose.model('Rating', ratingSchema)
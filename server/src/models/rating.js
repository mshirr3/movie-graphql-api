import mongoose from 'mongoose'

const ratingSchema = new mongoose.Schema({
    movieId: String,
    text: String,
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }
})

export default mongoose.model('Rating', ratingSchema)
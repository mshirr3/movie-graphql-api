import mongoose from 'mongoose'

const actorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    movies_played: [Number]
})

export default mongoose.model('Actor', actorSchema)
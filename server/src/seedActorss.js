import mongoose from 'mongoose'
import fs from 'fs'
import csv from 'csv-parser'
import dirtyJSON from 'dirty-json'
import Actor from './models/actor.js'

mongoose.connect("mongodb+srv://mohameddshire:1W7lcROe89ri57w3@apidesign.lakzulz.mongodb.net/?retryWrites=true&w=majority&appName=apidesign")
mongoose.connection.once('open', () => console.log('Connected to MongoDB'))

const BATCH_SIZE = 5000
let actorOps = []

async function flushBatch() {
  if (actorOps.length === 0) return
  try {
    await Actor.bulkWrite(actorOps, { ordered: false })
    console.log(`Inserted batch of ${actorOps.length} actors`)
  } catch (err) {
    console.error('Bulk insert error:', err.message)
  }
  actorOps = []
}

// keep a reference to the stream
const stream = fs.createReadStream('data/credits.csv').pipe(csv())

stream.on('data', (row) => {
  try {
    const cast = dirtyJSON.parse(row.cast)
    const movieId = row.id // using raw id for now

    for (const actor of cast) {
      actorOps.push({
        updateOne: {
          filter: { name: actor.name },
          update: {
            $setOnInsert: { name: actor.name },
            $addToSet: { movies_played: movieId }
          },
          upsert: true
        }
      })
    }

    if (actorOps.length >= BATCH_SIZE) {
      stream.pause()
      flushBatch().then(() => stream.resume())
    }
  } catch (err) {
    console.error(`Error parsing actors for movie ${row.id}`, err.message)
  }
})

stream.on('end', async () => {
  console.log(`Final flush of ${actorOps.length} ops`)
  await flushBatch()
  console.log('Finished seeding actors')
  mongoose.connection.close()
})

import { gql } from 'graphql-tag'
// The data types and query fields
const typeDefs = gql`
  type Query {
    "Query to get a movie, filtered by genre or year"
    movies(genre: String, release_year: Int): [Movie]
    movie(id: ID!): Movie
    ratings(movie_id: ID!): [Rating]
    actors: [Actor]
  }  

  type Mutation {
    addMovie(title: String!, release_year: Int!, genre: String!): Movie
  }

  type Movie {
    id: ID!
    title: String!
    release_year: Int
    genre: String
    description: String
  }

  type Actor {
    id: ID!
    name: String!
    movies_played: [Movie]
  }

  type Rating {
    id: ID!
    text: String!
    movie: Movie!
  }
`

export default typeDefs
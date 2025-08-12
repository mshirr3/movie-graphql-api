import { gql } from 'graphql-tag'
// The data types and query fields
const typeDefs = gql`
  type Query {
    "Query to get a movie, filtered by genre or year"
    movies(genre: String, release_year: Int): [Movie]

    movie(id: ID!): Movie

    ratings(movieId: ID!): [Rating]
    
    actors: [Actor]
  }  

  type Mutation {
    register(username: String!, password: String!): String
    login(username: String!, password: String!): String
    addMovie(title: String!, release_year: Int!, genre: String!): Movie
  }

  type Movie { 
    id: ID!
    title: String!
    release_year: Int
    genre: String
    description: String
    ratings: [Rating]
  }

  type Actor {
    id: ID!
    name: String!
    movies_played: [Movie]
  }

  type Rating {
    movieId: ID!
    text: String!
    movie: Movie!
  }
`

export default typeDefs
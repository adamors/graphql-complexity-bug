const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const {
  createComplexityRule,
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator
} = require('graphql-query-complexity')

const schema = buildSchema(`
  type Query {
    hello: String
  }

  input AddFavoriteFoodInput {
    id: ID!
    comment: String!
    foodNames: [String!]!
  }

  type Mutation {
    addFavoriteFood(input: AddFavoriteFoodInput!): Boolean!
  }

`)

const db = {}

const root = {
  hello: () => {
    return 'Hello world!'
  },
  addFavoriteFood: ({input}) => {
    db[input.id] = input
    return true
  }

}

const app = express()

const validationRules = (variables)=> {
  if (process.env.QUERY_COMPLEXITY_REPORTING_ENABLED  !== 'true') {
    return []
  }

  return [
    createComplexityRule({
      estimators: [
        simpleEstimator({ defaultComplexity: 1 }),
      ],
      maximumComplexity: 1000,
      variables,
      onComplete: (complexity) => {
        console.log('Query Complexity:', complexity)
      }
    })
  ]
}

app.use('/graphql', graphqlHTTP(async (request, response, { variables }) => ({
  schema: schema,
  rootValue: root,
  validationRules: validationRules(variables)
})))

module.exports = {
  app
}

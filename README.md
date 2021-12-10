### Bug reproduction for graphql-query-complexity

When GraphQL Complexity is enabled, an invalid mutation input can trigger a
weird error.

Given the following schema

```graphql
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
```

if you run the mutation


```graphql
mutation AddFavoriteFood($input: AddFavoriteFoodInput!) {
  addFavoriteFood(input: $input)
}
```

with variables

```json
{
  "input": {
    "id": "123",
    "comment": "Hello",
    "foodNames": [
      "Pizza",
      "Apple",
       null,
      "Pineapple"
    ]
  }
}
```
 the expected error message is:

 ```javascript
 "Variable \"$input\" got invalid value null at \"input.foodNames[2]\";
 Expected non-nullable type \"String!\" not to be null."
 ```

 However with GraphQL Complexity enabled, this turns into
```javascript
"Argument \"input\" of required type \"AddFavoriteFoodInput!\" was provided the
variable \"$input\" which was not provided a runtime value."
```

#### Using this repo

You can either stand up the server with `npm start` and issue the mutation or
run the tests with `npm test` and you will see the issue there as well.

const request = require('supertest')
const { app } = require('../../src/app')

describe('integration', () => {
  describe('hello query', () => {
    it('works', async () => {
      const helloQuery = `
        query {
          hello
        }
      `
      const { body: {data: { hello }}} = await request(app)
        .post('/graphql')
        .send({ query: helloQuery})
        .expect(200)

      expect(hello).toEqual('Hello world!')
    })
  })

  describe('addFavoriteFood mutation', () => {
    describe('when input is valid', () => {
      it('works', async () => {
        const mutation = `
          mutation AddFavoriteFood($input: AddFavoriteFoodInput!) {
            addFavoriteFood(input: $input)
          }
        `
        const vars = {
          input: {
            id: '123',
            comment: 'Hello',
            foodNames: ['Apple', 'Orange']
          }
        }

        const { body: { data: { addFavoriteFood } } } = await request(app)
          .post('/graphql')
          .send({ query: mutation, variables: vars})
          .expect(200)

        expect(addFavoriteFood).toEqual(true)
      })
    })

    describe('when input is invalid', () => {
      describe('when query complexity is enabled', () => {
        beforeAll(async () => {
          process.env.QUERY_COMPLEXITY_REPORTING_ENABLED = 'true'
        })

        afterAll(async () => {
          process.env.QUERY_COMPLEXITY_REPORTING_ENABLED = 'false'
        })

        it('results in error message', async () => {
          const mutation = `
          mutation AddFavoriteFood($input: AddFavoriteFoodInput!) {
            addFavoriteFood(input: $input)
          }
        `
          const vars = {
            input: {
              id: '123',
              comment: 'Hello',
              foodNames: ['Apple', null, 'Orange']
            }
          }

          const { body: { errors } } = await request(app)
            .post('/graphql')
            .send({ query: mutation, variables: vars})
            .expect(400)

          expect(errors).toEqual(
            [{
              message: 'Argument \"input\" of required type \"AddFavoriteFoodInput!\" was provided the variable \"$input\" which was not provided a runtime value.',
              locations: [{ column: 36, line: 3}]
            }]
          )
        })
      })
      describe('when query complexity is disabled', () => {
        beforeAll(async () => {
          process.env.QUERY_COMPLEXITY_REPORTING_ENABLED = 'false'
        })

        it('results in error message', async () => {
          const mutation = `
          mutation AddFavoriteFood($input: AddFavoriteFoodInput!) {
            addFavoriteFood(input: $input)
          }
        `
          const vars = {
            input: {
              id: '123',
              comment: 'Hello',
              foodNames: ['Apple', null, 'Orange']
            }
          }

          const { body: { errors } } = await request(app)
            .post('/graphql')
            .send({ query: mutation, variables: vars})
            .expect(500)

          expect(errors).toEqual(
            [{
              message: 'Variable "$input" got invalid value null at "input.foodNames[1]"; Expected non-nullable type "String!" not to be null.',
              locations: [{ column: 36, line: 2}]
            }]
          )
        })
      })
    })
  })
})

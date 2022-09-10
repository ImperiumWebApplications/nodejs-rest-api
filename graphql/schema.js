// Write the graphql schema here
const graphql = require("graphql");
const { buildSchema } = graphql;
module.exports = buildSchema(`
    type RootMutation{
        signup(email: String!, password: String!, name: String!): User!
    }

    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!

    }


    type Post{
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type AuthData{
        userId: ID!
        token: String!
    }


    type RootQuery{
        login(email: String!, password: String!): AuthData!
    }



    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

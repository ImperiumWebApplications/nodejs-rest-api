// Write the graphql schema here
const graphql = require("graphql");
const { buildSchema } = graphql;
module.exports = buildSchema(`
    type RootMutation{
        signup(email: String!, password: String!, name: String!, status: String!): User!
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

    type RootQuery{
        hello: String
    }



    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

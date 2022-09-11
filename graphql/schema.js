// Write the graphql schema here
const graphql = require("graphql");
const { buildSchema } = graphql;
module.exports = buildSchema(`
    type RootMutation{
        signup(email: String!, password: String!, name: String!): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
    }

    type User{
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!

    }


    input PostInputData{
        title: String!
        content: String!
        imageUrl: String!
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

    type AllPosts{
        posts: [Post!]!
        totalPosts: Int!
    }


    type RootQuery{
        login(email: String!, password: String!): AuthData!
        getPosts(page: Int): AllPosts!
        getPost(postId: ID!): Post!
    }



    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

import gql from 'graphql-tag';

const userTypedef = gql`
  type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
  }

  type Query {
    GetUserById(userId: ID!): User!
  }

  type Mutation {
    LoginUser(email: String!, password: String!): User!
  }
`;

export default userTypedef;
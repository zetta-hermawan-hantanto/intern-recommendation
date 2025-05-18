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
    RegisterUser(name: String!, email: String!, password: String!): User!
    LoginUser(email: String!, password: String!): User!
    LogoutUser: String!
  }
`;

export default userTypedef;

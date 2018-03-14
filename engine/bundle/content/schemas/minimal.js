module.exports = `

type Headlines {
  basic: String
}

type Query {
  type: String!
  version: String!
  headlines: Headlines
}
`

module.exports = `

type Site {
  site_url: String
}

type Child {
  _id: String
  name: String
  site: Site
  children: [Child]
}

type Query {
  _id: String!
  name: String
  children: [Child]
}
`

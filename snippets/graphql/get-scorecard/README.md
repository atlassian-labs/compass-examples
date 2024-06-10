# How to use this

This query will retrieve all specified information for a given scorecard.

Replace `scorecardARI` below in the variables section with a valid Compass component ARI in your site and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
query getScorecard($scorecardARI: ID!) {
  compass {
    scorecard(id: $scorecardARI) {
      __typename
      ... on CompassScorecard {
        id
        name
        description
        ownerId
        importance
        componentType
        criterias {
          id
          weight
        }
      }
      ... on QueryError {
        message
        extensions {
          statusCode
          errorType
        }
      }
    }
  }
}
```

### Query Headers

```
{
  "X-ExperimentalApi": ["compass-beta","compass-prototype"]
}
```

### Query Variables

```
{
  "scorecardARI": "your-scorecard-ari"
  # "scorecardARI": "ari:cloud:compass:8c9fa0a4-58bf-4a52-a1c2-fb9d071abcbd:scorecard/b17a5c71-52a9-4a98-a1a1-d3bdaba73178/01a7bf71-4cc2-4ab0-ad03-6aab38ec92ea"
}
```

# How to use this

This query will retrieve all metric values for a given component.

Simply replace `the-component-ari` below with a valid Compass component ARI in your site and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

```graphql
query getAMetricValue {
  compass {
    component(id: "the-component-ari") {
      ... on CompassComponent {
        metricSources(query: { first: 10 }) {
          ... on CompassComponentMetricSourcesConnection {
            nodes {
              metricDefinition {
                name
              }

              values {
                ... on CompassMetricSourceValuesConnection {
                  nodes {
                    value

                    timestamp
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

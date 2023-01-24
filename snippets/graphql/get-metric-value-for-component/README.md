# How to use this

This query will retrieve all metric values for a given component.

Simply replace `componentARI` below in the variables section with a valid [Compass component ARI](https://developer.atlassian.com/cloud/compass/config-as-code/manage-components-with-config-as-code/#find-a-component-s-id) in your site and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query
```graphql
query getAMetricValue {
  compass {
    component(id: "$componentARI") {
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

### Query Headers
```
{
  "X-ExperimentalApi": ["compass-beta","compass-prototype"]
}
```

### Query Variables
```
{
  "componentARI": "your-component-ari"
  # "componentARI": "ari:cloud:compass:8c9fa0a4-58bf-4a52-a1c2-fb9d071abcbd:component/b17a5c71-52a9-4a98-a1a1-d3bdaba73178/01a7bf71-4cc2-4ab0-ad03-6aab38ec92ea"
}
```

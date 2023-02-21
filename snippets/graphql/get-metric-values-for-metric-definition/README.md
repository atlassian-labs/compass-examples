This query can be used to get all metric values for metric sources with a specified metric definition.

Replace `cloudId` and `metricDefinitionId` below in the variables section with the cloudId for your site and the metric definition ID, and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.
### Query

```graphql
query getMetricDefinition ($cloudId: ID!, $metricDefinitionId: ID!){
  compass {
    metricDefinition(cloudId: $cloudId, metricDefinitionId: $metricDefinitionId) {
      ... on CompassMetricDefinition {
        id
        name
        metricSources {
          ... on CompassMetricSourcesConnection {
            nodes {
              id
              values {
                ... on CompassMetricSourceValuesConnection {
                  nodes {
                    value
                    timestamp
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
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
      "cloudId": "your-cloud-id",
      "metricDefinitionId: "your-metric-definition-id"
}
```

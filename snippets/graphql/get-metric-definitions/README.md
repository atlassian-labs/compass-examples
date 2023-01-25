# How to use this

This query will retrieve a list of metric definitions for your site.

Replace `cloudId` below in the variables section with the cloudId for your site and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
query getMetricDefinitions($query: CompassMetricDefinitionsQuery!) {
  compass {
    metricDefinitions(query: $query) {
      ... on CompassMetricDefinitionsConnection {
        nodes {
          id
          name
          description
          type
          format {
            ... on CompassMetricDefinitionFormatSuffix {
              suffix
            }
          }
          derivedEventTypes
        }

        pageInfo {
          hasNextPage
          endCursor
        }
      }

      ... on QueryError {
        ...CommonQueryError
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
    "query": {
      "cloudId": "your-cloud-id",
      "first": 10,
      "after": "endCursor or null"
    }
}
```

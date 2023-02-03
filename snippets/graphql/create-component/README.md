# How to use this

This query will retrieve a list of metric definitions for your site.

Replace `cloudId` below in the variables section with the cloudId for your site and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
mutation createComponent($cloudId: ID!, $componentDetails: CreateCompassComponentInput!) {
  compass {
    createComponent(cloudId: $cloudId, input: $componentDetails) {
      success
      componentDetails {
        id
        name
        type
      }    }
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

Type field could include following components - Service, Library, Application or Other. We are using "service" in the example below 

```
{
    "query": {
      "cloudId": "your-cloud-id",
      "componentDetails": {
          "name": "<XYZ>",
          "type": "SERVICE"
        }
}
```

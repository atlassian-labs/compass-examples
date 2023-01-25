# How to use this

This mutation will delete a given metric definition on your site. Note that only custom metric definitions can be deleted via API.

Replace `id` below in the variables section with the id for the desired metric definition, which can be retrieved using [getMetricDefinitions](/snippets/graphql/get-metric-definitions/README.md) and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
mutation deleteMetricDefinition($input: CompassDeleteMetricDefinitionInput!) {
  compass {
    deleteMetricDefinition(input: $input) {
      deletedMetricDefinitionId
      errors {
        message
      }
      success
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

### Mutation Variables

```
{ 
    "input": {
      "id": "metric-definition-id"
    }
}
```

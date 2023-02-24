# How to use this

This query will create a metric definition on your site.

Replace `cloudId` and `name` below in the variables section with the cloudId for your site and the name for your metric definition, and `suffix` with the units of your metric (ex: minutes, req/s) and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
mutation createMetricDefinition ($input: CompassCreateMetricDefinitionInput!) {
  compass {
    createMetricDefinition(
      input: $input
    ) {
      createdMetricDefinition {
        id
        name
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

### Query Variables

```
{
  "input": {
    "cloudId": "<cloud_id>",
    "name": "<name of your metric definition>",
    "format": {
      "suffix": {
        "suffix": "<the units of your metric>"
      }
    }
  }
}
```

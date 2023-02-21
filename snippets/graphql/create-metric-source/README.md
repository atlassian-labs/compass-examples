# How to use this

This query will create a metric defintion on your site.

Replace `componentId`, `externalMetricSourceId` and `metricDefinitionId` below in the variables section with the component id of the component to create the metric source for, the external identifier for the metric, and the metric definition ID, and execute the query. Follow [createMetricDefintion](/snippets/graphql/create-metric-definitions/README.md) to create a metric definition if you do not already have an metric definition ID, or follow [getMetricDefinitions](/snippets/graphql/get-metric-definitions/README.md) to retrieve a metric definiton ID. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
mutation createMetricSource ($input:CompassCreateMetricSourceInput!){
  compass {
    createMetricSource(
      input: $input
    ) {
      success
      createdMetricSource {
        title
        id
        metricDefinition {
          id
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
  "input": {
    "componentId": "<component-id>",
    "externalMetricSourceId": "<any string that can be used to correlate this metric with the external source>",
    "metricDefinitionId": "<metric-definition-id>"
  }
}
```

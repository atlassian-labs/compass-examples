# How to use this

This query will connect a metric to your component. 

Replace the following variables in the variables section below, and execute the query.

`component-id` - The component ID of the component to connect a metric to

`external-metric-source-id` - The identifier of your metric source in an external system, for example, a Bitbucket repository UUID.

`metric-definition-id` - The metric definition ID of the metric to be added. Follow [createMetricDefintion](/snippets/graphql/create-metric-definitions/README.md) to create a metric definition if you do not already have an metric definition ID, or follow [getMetricDefinitions](/snippets/graphql/get-metric-definitions/README.md) to retrieve a predefined or existing metric definition ID.


You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

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
    "externalMetricSourceId": "<external-metric-source-id>",
    "metricDefinitionId": "<metric-definition-id>"
  }
}
```

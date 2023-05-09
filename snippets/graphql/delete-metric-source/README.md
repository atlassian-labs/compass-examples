# How to use this

This query will delete a metric source given its ID. This will disconnect the metric from a specific component.

Replace `id` below in the variables section with a valid metric source ARI. These metric sources can be found for a particular component using the [getMetricValuesForComponent](/snippets/graphql/get-metric-values-for-component/README.md) query.

### Query

```graphql
mutation deleteMetricSource ($input:CompassDeleteMetricSourceInput!){
  compass {
    deleteMetricSource(
      input: $input
    ) {
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
    "id": "your-metric-source-id"
	}
}
```

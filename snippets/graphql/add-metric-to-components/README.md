This following steps can be used to add a metric for a subset or all components.

1. Create or retrieve a metric definition. Follow [createMetricDefintion](/snippets/graphql/create-metric-definitions/README.md) to create a metric definition and save the ***metric_definition_id***. To retrieve an existing metric definiton ID, follow [getMetricDefinitions](/snippets/graphql/get-metric-definitions/README.md) to retrieve a list of metric definitions on your site, or to add a predefined metric, grab the ID from [this list](https://developer.atlassian.com/cloud/compass/components/available-predefined-metrics/). 

2. Retrieve the subset of components you would like to apply the metric definition to. Follow [searchComponents](/snippets/graphql/search-components/README.md) to search components based on various filters and retrieve ***component_ids***. 

3. For each component, call [createMetricSource](/snippets/graphql/create-metric-source/README.md) with the ***metric_definition_id*** to apply the metric definition.

```
for component_id in <component_ids>
do
    query='mutation createMetricSource($input:CompassCreateMetricSourceInput!){ compass { createMetricSource( input: $input ) { success createdMetricSource { title id metricDefinition { id } } } } }'

    variables='{ "input": { "componentId": "$component_id", "externalMetricSourceId": "<externally idenfying id>", "metricDefinitionId": "<metric_definition_id>" } }'

  curl https://api.atlassian.com/graphql \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic <your-base-64-encoded-api-token>" \
    -H "X-ExperimentalApi: compass-beta" \
    -H "X-ExperimentalApi: compass-prototype" \
    -d "{ \"query\":\"$query\", \"variables\": $variables }"
done
```
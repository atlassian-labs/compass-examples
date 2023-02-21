This following can be used to apply a metric defintion across a subset or all components.

1. Create or retrieve a metric definition. Follow [createMetricDefintion](/snippets/graphql/create-metric-definitions/README.md) to create a metric definition and save the ***metric definition ID***. To retrieve a metric definiton, follow [getMetricDefinitions](/snippets/graphql/get-metric-definitions/README.md)

2. Retrieve the subset of components you would like to apply the metric definition to. Follow [searchComponents](/snippets/graphql/search-components/README.md) to search components based on various filters and retrieve ***component IDs***. 

3. For each component, call [createMetricSource](/snippets/graphql/create-metric-source/README.md) with the ***metric definition ID*** to apply the metric definition.
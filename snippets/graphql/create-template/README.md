# How to use this

This query will create a template on your site that can be used to quickly create new components. A template is a component with type template. Learn more about templates [here](https://developer.atlassian.com/cloud/compass/templates/about-templates/). Refer to [createComponentFromTemplate](../create-component-from-template/README.md) to create a component from this template, or  [createWebhook](../create-webhook/README.md) to create a webhook to receive a JSON payload after a component is created using this template.

Replace the following variables in the variables section below, and execute the query.

`cloud-id` - the cloudId for your site and component information.

`template-name` - the name of the template

`repository-url` - the repository that hosts the template code which will be forked for components created from this template (currently only Github is supported)

Ensure that the typeId is "TEMPLATE". You may also specify any other `componentDetails` that you may want for the template such as owner team or description.

### Query

```graphql
mutation createComponent($cloudId: ID!, $componentDetails: CreateCompassComponentInput!) {
  compass {
    createComponent(cloudId: $cloudId, input: $componentDetails) {
      success
      componentDetails {
        id
        name
        typeId
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

```
{
      "cloudId": "cloud-id",
      "componentDetails": {
          "name": "<template-name>",
          "links": {
                "type": "REPOSITORY",
                "url": <repository-url>
          }
          "typeId": "TEMPLATE"
        }
}
```

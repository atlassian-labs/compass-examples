# How to use this

This query will create a template on your site that can be used to quickly create new components. A template is a component with type template. Learn more about templates [here](https://developer.atlassian.com/cloud/compass/templates/about-templates/). Refer to [createComponentFromTemplate](../create-component-from-template/README.md) to create a component from this template, or  [createWebhook](../create-webhook/README.md) to create a webhook to receive a JSON payload after a component is created using this template.

Replace `cloudId` and `componentDetails` below in the variables section with the cloudId for your site and component information, and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

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
      "cloudId": "your-cloud-id",
      "componentDetails": {
          "name": "<XYZ>",
          "typeId": "TEMPLATE"
        }
}
```

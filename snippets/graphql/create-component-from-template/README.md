# How to use this

This query will create a component from a template on your site. Note that this mutation will require an `@optIn(to: ["compass-beta"])` directive placed either on the `createComponentFromTemplate` field or on any parent (as done below). Refer to [createTemplate](../create-template/README.md) to create a template, or [createWebhook](../create-webhook/README.md) to create a webhook to receive a JSON payload after a component is created from a template.

Replace `templateComponentId` and `createComponentDetails` below in the variables section with the ID of the template component you are using and component information, and execute the query. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.


### Query

```graphql
mutation createComponentFromTemplate($input: CreateCompassComponentFromTemplateInput!) {
  compass @optIn(to: ["compass-beta"]) {
    createComponentFromTemplate(input: $input) {
      success

      componentDetails {
        ...CompassComponentCore
      }

      errors {
        ...CommonMutationError
      }
    }
  }
}


```

### Query Variables

```
{
      "input": {
        "templateComponentId": "<template-component-id>",
        "createComponentDetails": {
            "name": "<XYZ>",
            "typeId": "SERVICE"
            }
      }
}
```

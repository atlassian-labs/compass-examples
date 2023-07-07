# How to use this

This query will create a webhook for a component. This webhook is currently used to receive a JSON payload when a component is created from a template. Refer to [createTemplate](../create-template/README.md) to create a template, or [createComponentFromTemplate](../create-component-from-template/README.md) to create a component from a template.

Replace the following variables in the variables section below, and execute the query.

`component-id` - The component ID of the component to create a webhook for.

`url-of-your-webhook` - The url of the webhook.


You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
mutation createWebhook($input: CompassCreateWebhookInput!) {
  compass {
    createWebhook(input: $input) {
      success
      webhookDetails {
        id
        url
      }
      errors {
        ...CommonMutationError
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
    "url": "<url-of-your-webhook>"
  }
}
```

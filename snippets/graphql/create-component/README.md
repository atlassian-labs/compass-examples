# How to use this

This query will create a component on your site.

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

We are using "SERVICE" as a component type in the example below, to learn about different component types, check this [link](https://developer.atlassian.com/cloud/compass/components/what-is-a-component/#component-types)

```
{
      "cloudId": "your-cloud-id",
      "componentDetails": {
          "name": "<XYZ>",
          "typeId": "SERVICE"
        }
}
```

# How to use this

This query will get all of the custom fields applied to a given component.

Replace `<component_id>` below in the query section. 

You can get a component's id by following the steps below:
1. In Compass, go to a component’s details page. Learn how to view a component's details
2. Select more actions (•••) then Copy component ID.

You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
query getComponentCustomFields {
  compass {
    component(id: "<component_id>") {
      ... on QueryError {
        identifier
        message
        extensions {
          statusCode
          errorType
        }
      }
      ... on CompassComponent {
        id
        name
        customFields {
          definition {
            id
            name
          }
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

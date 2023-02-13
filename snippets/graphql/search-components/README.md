# How to use this

This query will retrieve a paginate-able subset of components with various filters, fuzzy querying, and sorting.

Replace `cloudId` below in the variables section with the cloudId for your site and execute the query.. You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

### Query

```graphql
query searchCompassComponents($cloudId: String!, $query: CompassSearchComponentQuery) {
  compass {
    searchComponents(cloudId: $cloudId, query: $query) {
      ... on CompassSearchComponentConnection {
        nodes {
            link
            component {
              name
              description
              typeId
              ownerId
              links {
                id
                type
                name
                url
              }
              labels {
                name
              }
              customFields {
                definition {
                  id
                  name
                }
                ...on CompassCustomBooleanField {
                  booleanValue
                }
                ...on CompassCustomTextField {
                  textValue
                }
                ...on CompassCustomNumberField {
                  numberValue
                }
                ...on CompassCustomUserField {
                  userValue {
                    id
                    name
                    picture
                    accountId
                    canonicalAccountId
                    accountStatus
                  }
                }
              }
            }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
      ... on QueryError {
        message
        extensions {
          statusCode
          errorType
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


##### Query with Component Type Filter
```
{
  "cloudId": "<cloud_id>",
	"query": {
    "fieldFilters": [
      {
        "name": "type",
        "filter": {
          "eq":"SERVICE"
        }
      }
    ] 
  }
}
```

##### Query with Pagination and Component Type Filter
```
{
  "cloudId": "<cloud_id>",
	"query": {
    "first": "<20>"
    "after": "<pageInfo.endCursor from previously made query>"
    "fieldFilters": [
      {
        "name": "type",
        "filter": {
          "eq":"SERVICE"
        }
      }
    ] 
  }
}
```

##### Query with Fuzzy Text Search
```
{
  "cloudId": "<cloud_id>",
	"query": {
    "query": "<fuzzy_text_match>"
  }
}
```

##### Query Sorted by Name Descending
```
{
  "cloudId": "<cloud_id>",
	"query": {
    "sort": {
      "name": "title",
      "order": "DESC"
    }
  }
}
```

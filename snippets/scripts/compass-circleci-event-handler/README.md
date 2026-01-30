# How to use this
Copy a script from config-example.yml file to your project's config to get events from your project.

Variables in the example:
- **component-external-event-source-id** - get link to project CircleCI pipelines that you fill to Projects links in the Compass component (example: https://app.circleci.com/pipelines/github/test/potential-octo-giggle or https://app.circleci.com/pipelines/bitbucket/test/potential-octo-giggle). Copy string from `/pipelines` (example: `github/test/potential-octo-giggle` or `bitbucket/test/potential-octo-giggle`) and change github or bitbucket to gh or bb (example: `gh/test/potentian-octo-giggle` or `bb/test/potential-octo-giggle`). Add the final string to `externalEventSourceId` field in the config file;

- **name-of-your-site** - go to your site and copy the string before .atlassian.net/…. Example: `test-site.atlassian.net/compass` - you should copy only test-site. Add the final string to `name-of-your-site` field in the config file;

- **$USER-EMAIL** - your email of site on Atlassian. Add email to the CircleCI project’s variables. Path to the CircleCI project’s variables: *Projects → Your project’s settings → Environments Variables → Add. Name: USER-EMAIL*; 

- **$TOKEN** - create an API token. Open the link (https://id.atlassian.com/manage-profile/security/api-tokens) and create a token. After that, add the Token to the CircleCI project’s variables. Path to the CircleCI project’s variables: *Projects → Your project’s settings → Environments Variables → Add; Name: TOKEN*;

- **$CLOUD-ID** - to get your `cloudId`, you should click on your avatar and go to the Profile. After loading the page in the URL, you should see at the end of the URL a query parameter - cloudId. Copy the cloudId and add it to the CircleCI project’s variables. Path to the CircleCI project’s variables: *Projects → Your project’s settings → Environments Variables → Add. Name: CLOUD-ID*; 

- **$COMPONENT-ID** - copy component’s id in the component. Click on `…` → `Copy component ID`. Add the Component ID to the CircleCI project’s variables. Path to the CircleCI project’s variables: *Projects → Your project’s settings → Environments Variables → Add; Name: COMPONENT-ID*;

## How to get all CircleCI components

You should use the GraphQL query:

```
query searchComponents($cloudId: String!, $query: CompassSearchComponentQuery) {
  compass {
    searchComponents(cloudId: $cloudId, query: $query) {
      ... on QueryError {
        identifier
        message
      }
      ... on CompassSearchComponentConnection {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          component {
            name
            id
            links {
              name
              type
              url
            }
          }
        }
      }
    }
  }
}
```
and query variables:
```
{
  "cloudId": <your-cloud-id>,
  "query": {
    "first": 100,
    "fieldFilters": [
      {
        "name": "linkTypes",
        "filter": { "eq": "PROJECT" }
      }
    ]
  }
}
```

To use this query, go to the link: `https://<your-site-name>.atlassian.net/gateway/api/graphql` and copy-paste the GraphQL query to the query editor and copy-paste variables to the Variables editor in the bottom of the page, and click the Run button. You will see all components with the Projects link type in your site. You can find a component that has a CircleCI link and open a link to set up the config file.
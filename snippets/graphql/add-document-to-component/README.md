This query can be used to add a document to a component
https://developer.atlassian.com/cloud/compass/graphql/#mutations_addDocument
https://developer.atlassian.com/cloud/compass/graphql/#queries_documentationCategories



Replace cloudId, title, url, ComponentID and documentationCategoryId below in the variables section with the cloudId for your site, title and url of your document, componentID of your Compass component and the documentationcategory ID, and execute the query. You can use the GraphQL explorer to run this query and explore the Compass API further.

NB: The addDocument mutation in Compass is an experimental feature, and you need to explicitly opt in by using the @optIn directive.

First, you need to fetch the DocumentationCategoryID for the components.

STEP 1: => Fetch DocumentationCategoryID for the component

##QUERY


```graphql
query fetchDocumentationCategories($cloudId: ID!, $first: Int, $after: String) {
  compass {
    documentationCategories(cloudId: $cloudId, first: $first, after: $after) @optIn(to: "compass-beta") {
      nodes {
        id
        name
      }
      edges {
        node {
          id
          name
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
}

##Query Variables

```graphql
{
  "cloudId": "YOUR-CLOUD-ID",
  "first": 10,
  "after": null
}


From the above result, you will get the Document Category ID in the ARI format for the following types:

Discover
Contributor
Maintainer
Other

Step 2: Use the following query to add a document to your Compass

##QUERY

```graphql
mutation addDocument($input: CompassAddDocumentInput!) {
  compass {
    addDocument(input: $input) @optIn(to: "compass-beta") {
      success
      errors {
        message
      }
      documentDetails {
        id
        title
        url
        componentId
        documentationCategoryId
      }
    }
  }
}

##QUERY VARIABLES

```graphql
{
  "input": {
    "title": "title",
    "url": "your-doc-url",
    "componentId": "Your-component-id",
    "documentationCategoryId": "your-documentationcateoryid"
  }
}


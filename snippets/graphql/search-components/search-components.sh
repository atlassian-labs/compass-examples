##
# This is a sample bash script that can be used to run the searchComponents query to retrieve 
# all components of type service. 
# Replace <your-cloud-id> and <your-api-key> with your own values. 
##
query='query searchCompassComponents($cloudId: String!, $query: CompassSearchComponentQuery) {
  compass {
    searchComponents(cloudId: $cloudId, query: $query) {
      ... on CompassSearchComponentConnection {
        nodes {
            component {
              id
              customFields {
                definition {
                  id
                  name
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
}'
query="$(echo $query)"

variables='{
  "cloudId": "<your-cloud-id>",
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
}'

response=$(curl https://api.atlassian.com/graphql \
-X POST \
-H "Content-Type: application/json" \
-H "Authorization: Basic <your-api-key>" \
-H "X-ExperimentalApi: compass-beta, compass-prototype" \
-d "{ \"query\":\"$query\", \"variables\": $variables }")

echo $response
for id in $(echo "$response" | jq -r '.data.compass.searchComponents.nodes[].component.id'); do
  echo "$id"
done

##
# This is a sample bash script that can be used to run the searchComponents query to retrieve 
# all components of type service. 
# Replace <your-cloud-id> and <your-api-key> with your own values and adjust the search critera (fieldFilters) as needed. 
##
query='query searchCompassComponents($cloudId: String!, $query: CompassSearchComponentQuery) {
  compass {
    searchComponents(cloudId: $cloudId, query: $query) {
      ... on CompassSearchComponentConnection {
        nodes {
            component {
              id
            }
        }
        pageInfo {
          hasNextPage
          endCursor
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

api_token="<your-api-token>"
email="<your-email>"
auth_header="${email}:${api_token}"
encoded_auth_header=$(echo -n "${auth_header}" | base64)

hasNextPage=true
while [ "$hasNextPage" = true ]
do response=$(curl https://api.atlassian.com/graphql \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic $encoded_auth_header" \
    -d "{ \"query\":\"$query\", \"variables\": $variables }")

    for id in $(echo "$response" | jq -r '.data.compass.searchComponents.nodes[].component.id'); do
        echo "$id"
    done

    hasNextPage=$(echo "$response" | jq -r '.data.compass.searchComponents.pageInfo.hasNextPage')
    if [ "$hasNextPage" = true ]
    then
        endCursor=$(echo "$response" | jq -r '.data.compass.searchComponents.pageInfo.endCursor')
        variables=$(echo "$variables" | jq --arg endCursor "$endCursor" '.query.after = $endCursor')
    fi
done
##
# This is a sample bash script that can be used to update a list of components.
# Replace <your-cloud-id> and <your-api-key> and <list-of-your-component-ids> with your own values. 
##
query='mutation updateComponentCustomField($input: UpdateCompassComponentInput!) {
  compass {
    updateComponent(input: $input) {
      success
      errors {
        message
        extensions {
          statusCode
          errorType
        }
      }
      componentDetails {
        id
        name
        customFields {
          definition {
            id
            name
          }
          ...on CompassCustomTextField {
            textValue
          }
        }
      }
    }
  }
}'

query="$(echo $query)"

for id in <list-of-component-ids>; do
  variables="{
    \"input\": {
      \"id\": \"$id\",
      \"customFields\": [{
        \"textField\": {
          \"definitionId\": \"ari:cloud:compass:55a49325-e8ef-4987-81ca-5979fe159c3c:custom-field-definition/65431be5-fcf3-4914-b8ae-123e8e2b405b/ed5dfc29-67bb-4ddb-868b-b76228d12e1c\",
          \"textValue\": \"false\"
        }
      }]
    }
  }"
  curl https://api.atlassian.com/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <your-api-key>" \
  -H "X-ExperimentalApi: compass-beta, compass-prototype" \
  -d "{ \"query\":\"$query\", \"variables\": $variables }"
done

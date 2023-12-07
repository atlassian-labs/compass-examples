##
# This is a sample bash script that can be used to update custom fields for a list of components.
# Replace <your-cloud-id> <your-api-key> <list-of-component-ids> and <your-custom-field-definition-id> with your own values. 
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
          \"definitionId\": \"<your-custom-field-definition-id>\",
          \"textValue\": \"false\"
        }
      }]
    }
  }"
  curl https://api.atlassian.com/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <your-api-key>" \
  -d "{ \"query\":\"$query\", \"variables\": $variables }"
done

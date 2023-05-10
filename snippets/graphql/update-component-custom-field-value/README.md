# How to use this

This query will update the value of a custom field for a given component

Replace `<component_id>`, `<definition_id>`, and `<my_value>` below in the variables section. 

You can get a component's id by following the steps below:
1. In Compass, go to a component’s details page. Learn how to view a component's details
2. Select more actions (•••) then Copy component ID.

Check the [graphQL example for getting custom field definitions for a given component](../get-component-custom-field-definitions/README.md) to get the relevant definition's id.

Depending on what type the custom field's values are, choose the correct input that matches.

You can use [the GraphQL explorer](https://developer.atlassian.com/cloud/compass/graphql/explorer/) to run this query and explore [the Compass API](https://developer.atlassian.com/cloud/compass/graphql/) further.

Refer to `update-components.sh` for a sample bash script using this mutation.
### Mutation

```graphql
mutation updateComponentCustomField($input: UpdateCompassComponentInput!) {
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
  }
}

```

### Mutation Headers

```
{
  "X-ExperimentalApi": ["compass-beta","compass-prototype"]
}
```

### Mutation Variables

##### Boolean Custom Field
```
{
  "input": {
		"id": "<component_id>",
    "customFields": [{
      "booleanField": {
        "definitionId": "<definition_id>",
        "booleanValue": "<true/false>"
      }
    }]
  }
}
```

##### String / Text Custom Field
```
{
  "input": {
		"id": "<component_id>",
    "customFields": [{
      "textField": {
        "definitionId": "<definition_id>",
        "textValue": "<my_value>"
      }
    }]
  }
}
```

##### Number Custom Field
```
{
  "input": {
		"id": "<component_id>",
    "customFields": [{
      "numberField": {
        "definitionId": "<definition_id>",
        "numberValue": "<5.0>"
      }
    }]
  }
}
```

##### User Custom Field
```
{
  "input": {
		"id": "<component_id>",
    "customFields": [{
      "userField": {
        "definitionId": "<definition_id>",
        "userIdValue": "<user_id>"
      }
    }]
  }
}
```

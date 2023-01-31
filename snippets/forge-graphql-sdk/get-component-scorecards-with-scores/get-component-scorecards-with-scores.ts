const scorecardsQuery = `query getComponentScorecardsWithScores($componentId: ID!) {
    compass {
      component(id: $componentId) {
        __typename
        ... on CompassComponent {
          id
          name
  
          scorecards {
            id
            name
            importance

            scorecardScore(query: { componentId: $componentId }) {
              totalScore
              maxTotalScore
            }
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
  }`;
  const variables = {
    componentId: 'COMPONENT-ID',
  };
  const headers = { 'X-ExperimentalApi': 'compass-beta, compass-prototype' };
  const req = await graphqlGateway.compass.api.asApp().requestGraph(scorecardsQuery, variables, headers);
  const result = await req.json();

  console.log(result.data.compass.component.scorecards);
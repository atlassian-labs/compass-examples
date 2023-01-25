await graphqlGateway.compass.asApp().searchComponents({
    cloudId: 'CLOUD_ID',
    query: {
      query: 'COMPONENT NAME HERE',
      fieldFilters: [
        {
          name: 'ownerId',
          filter: {
            eq: 'ari:cloud:teams::team/TEAM-ID',
          },
        },
        {
          name: 'labels',
          filter: {
            in: ['LABEL-NAME'],
          },
        },
      ],
    },
  });

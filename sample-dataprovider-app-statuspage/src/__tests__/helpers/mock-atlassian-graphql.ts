export const mockCreateEvent = jest.fn();
export const mockInsertMetricValue = jest.fn();

export function mockAtlassianGraphQL() {
  const requestGraph = jest.fn();

  // Global API mock
  (global as any).api = {
    asApp: () => ({
      requestGraph,
    }),
  };

  jest.mock('@atlassian/forge-graphql', () => ({
    ...(jest.requireActual('@atlassian/forge-graphql') as any),
    compass: {
      asApp: () => ({
        createEvent: mockCreateEvent,
        insertMetricValueByExternalId: mockInsertMetricValue,
      }),
    },
  }));
}

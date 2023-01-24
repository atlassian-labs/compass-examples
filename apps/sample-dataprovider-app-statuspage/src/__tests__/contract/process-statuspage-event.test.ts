/* eslint-disable import/order */
import { mockAtlassianGraphQL, mockCreateEvent } from '../helpers/mock-atlassian-graphql';
/* eslint-disable import/first */
mockAtlassianGraphQL();

import processStatuspageEvent from '../../entry/webtriggers/process-statuspage-incident-event';
import { MOCK_STATUSPAGE_INCIDENT_UPDATE } from '../../mocks';

describe('Example webtrigger', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(Date.now());
  });

  test('makes request to Atlassian GraphQL Gateway to create incident event', async () => {
    await processStatuspageEvent(
      {
        body: JSON.stringify(MOCK_STATUSPAGE_INCIDENT_UPDATE),
      },
      {
        installContext: 'test-site/site-id',
      },
    );

    expect(mockCreateEvent).toBeCalledTimes(1);
    expect(mockCreateEvent).toBeCalledWith({
      cloudId: 'site-id',
      event: {
        incident: {
          externalEventSourceId: MOCK_STATUSPAGE_INCIDENT_UPDATE.page.id,
          displayName: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.name,
          description: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.incident_updates[0].body,
          lastUpdated: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.updated_at,
          updateSequenceNumber: Date.now(),
          url: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.shortlink,
          incidentProperties: {
            id: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.id,
            state: 'RESOLVED',
            severity: {
              label: 'critical',
              level: 'ONE',
            },
            startTime: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.created_at,
            endTime: MOCK_STATUSPAGE_INCIDENT_UPDATE.incident.resolved_at,
          },
        },
      },
    });
  });
});

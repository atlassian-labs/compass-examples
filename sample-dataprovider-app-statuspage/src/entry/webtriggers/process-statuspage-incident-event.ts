import graphqlGateway from '@atlassian/forge-graphql';
import { toIncidentEvent } from '../../utils/statuspage-incident-transformers';
import { WebtriggerRequest, WebtriggerResponse, StatuspageEvent } from '../../types';
import { serverResponse } from '../../utils/webtrigger-utils';

type Context = {
  installContext: string;
};

export default async function processStatuspageIncidentEvent(
  request: WebtriggerRequest,
  context: Context,
): Promise<WebtriggerResponse> {
  const { installContext } = context;

  const cloudId = installContext.split('/')[1];
  const eventPayload = request.body;

  let parsedEvent: StatuspageEvent;

  try {
    parsedEvent = JSON.parse(eventPayload);
  } catch (error) {
    console.error({ message: 'Failed parsing webhook event', error });
    return serverResponse('Invalid event format', null, 400);
  }

  // Don't send updates for non-incident events or scheduled updates
  if (!('incident' in parsedEvent) || parsedEvent.incident.status === 'scheduled') {
    return serverResponse('Processed webhook event');
  }

  await graphqlGateway.compass.asApp().createEvent({
    cloudId,
    event: {
      incident: toIncidentEvent(parsedEvent.incident, parsedEvent.page.id),
    },
  });

  return serverResponse('Processed webhook event');
}

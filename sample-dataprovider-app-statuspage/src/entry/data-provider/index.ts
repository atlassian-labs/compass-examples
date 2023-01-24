import {
  DataProviderEventTypes,
  DataProviderResponse,
  DataProviderResult,
  BuiltinMetricDefinitions,
} from '@atlassian/forge-graphql';

import { storage } from '@forge/api';

import { toDataProviderIncident } from '../../utils/statuspage-incident-transformers';
import { getPageCode, createWebhookSubscription, getPreviousIncidents } from '../../utils/statuspage-utils';
import { StatuspageIncident } from '../../types';

import { DataProviderPayload } from './types';

export const dataProvider = async (request: DataProviderPayload): Promise<DataProviderResult> => {
  const pageCode = await getPageCode(request.url);

  // make a webhook subscription on the statuspage
  const apiKey = await storage.getSecret('manageAPIKey');
  const email = await storage.getSecret('manageEmail');

  if (apiKey === undefined || apiKey == null || email === undefined || email === null) {
    console.warn('API key or email not properly set up. Cannot process link.');
    return null;
  }

  await createWebhookSubscription(pageCode, apiKey, email);

  // get previous incidents for this statuspage
  const backfilledIncidents = await getPreviousIncidents(request.url);

  const transformedIncidents = backfilledIncidents.map((incident: StatuspageIncident) =>
    toDataProviderIncident(incident),
  );

  const response = new DataProviderResponse(pageCode, {
    eventTypes: [DataProviderEventTypes.INCIDENTS],
    builtInMetricDefinitions: [
      {
        name: BuiltinMetricDefinitions.MTTR_LAST_10,
        derived: true,
      },
    ],
    customMetricDefinitions: [],
  });

  return response.addIncidents(transformedIncidents).build();
};

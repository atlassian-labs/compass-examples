/* eslint-disable import/order */
import { storage, mockForgeApi } from './helpers/forge-helper';
/* eslint-disable import/first */
mockForgeApi();
import { dataProvider } from '../index';
import * as statusAPI from '../../../client/statuspage-status';
import * as createWebhookSubscription from '../../../client/statuspage-manage';
import { MOCK_STATUSPAGE_INCIDENT_UPDATE } from '../../../mocks';

const getPageIdSpy = jest.spyOn(statusAPI, 'getPageId');
const createWebhookSpy = jest.spyOn(createWebhookSubscription, 'createSubscription');
const getIncidentsSpy = jest.spyOn(statusAPI, 'getIncidents');

describe('dataProvider module', () => {
  it('successfully returns events and metrics in the expected format', async () => {
    storage.getSecret.mockResolvedValue('mock token');

    getPageIdSpy.mockResolvedValue('mock-page-id');
    createWebhookSpy.mockResolvedValue({
      status: 200,
    });
    getIncidentsSpy.mockResolvedValue([MOCK_STATUSPAGE_INCIDENT_UPDATE.incident]);

    const result = await dataProvider({
      url: 'https://teststatuspage.statuspage.io/',
      ctx: {
        cloudId: 'ari:cloud:compass:122345:component/12345/12345',
        extensionId: 'mock-extension-id',
      },
    });

    expect(result.externalSourceId).toEqual('mock-page-id');
    expect(result.metrics).toMatchSnapshot();
    expect(result.events).toMatchSnapshot();
  });
});

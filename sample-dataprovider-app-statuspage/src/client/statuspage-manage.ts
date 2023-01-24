import { fetch, webTrigger } from '@forge/api';

const BASE_URL = 'https://api.statuspage.io/v1';

async function makeGetRequest(url: string, token: string, options: any = {}) {
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
async function makePostRequest(url: string, body: any, token: string) {
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
export async function getPages(token: string) {
  const url = `${BASE_URL}/pages`;
  const result = await makeGetRequest(url, token);
  if (result.status !== 200) {
    throw Error('Bad Statuspage API response');
  }
  return result.json();
}
export async function createSubscription(pageCode: string, email: string, token: string) {
  const url = `${BASE_URL}/pages/${pageCode}/subscribers`;
  const webTriggerUrl = await webTrigger.getUrl('handle-statuspage-event');
  const body = {
    subscriber: {
      email,
      endpoint: webTriggerUrl,
    },
  };

  const result = await makePostRequest(url, body, token);
  // Webhook for this page has already been added
  if (result.status === 409) {
    return result.json();
  }
  if (result.status !== 201) {
    throw Error('Bad Statuspage API response');
  }
  return result.json();
}

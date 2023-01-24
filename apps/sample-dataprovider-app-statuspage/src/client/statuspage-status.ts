import { fetch } from '@forge/api';

export async function getIncidents(baseUrl: string) {
  const result = await fetch(`${baseUrl}/api/v2/incidents.json`);
  const body = await result.json();
  return body.incidents;
}
export async function getPageId(baseUrl: string) {
  const result = await fetch(`${baseUrl}/api/v2/summary.json`);
  const body = await result.json();
  return body.page.id;
}

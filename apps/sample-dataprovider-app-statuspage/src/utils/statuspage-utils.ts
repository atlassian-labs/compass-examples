import { getPageId, getIncidents } from '../client/statuspage-status';
import { createSubscription } from '../client/statuspage-manage';

export async function getPageCode(url: string) {
  const pageCode = await getPageId(url.replace(/\/$/, ''));
  return pageCode;
}
export async function getPreviousIncidents(url: string) {
  const incidents = await getIncidents(url.replace(/\/$/, ''));
  return incidents;
}
export async function createWebhookSubscription(pageCode: string, token: string, email: string) {
  await createSubscription(pageCode, email, token);
}

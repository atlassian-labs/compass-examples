import Resolver from '@forge/resolver';

import { storage } from '@forge/api';
import { getPages } from './client/statuspage-manage';

const resolver = new Resolver();

resolver.define('validateAndConnectAPIKey', async (req) => {
  const { apiKey, email } = req.payload as { apiKey: string; email: string };

  const pagesData = await getPages(apiKey);
  if (Object.entries(pagesData).length === 0) {
    return {
      success: false,
    };
  }

  await storage.setSecret('manageAPIKey', apiKey);
  await storage.setSecret('manageEmail', email);
  return {
    success: true,
  };
});

resolver.define('disconnectAPIKey', async () => {
  await storage.deleteSecret('apiKeyName');
  await storage.deleteSecret('manageEmail');
  return {
    success: true,
  };
});

resolver.define('isAPIKeyConnected', async () => {
  const apiKey = await storage.getSecret('manageAPIKey');
  if (apiKey !== undefined && apiKey !== null) {
    return {
      isConnected: false,
    };
  }

  const pagesData = await getPages(apiKey);

  return {
    isConnected: Object.entries(pagesData).length !== 0,
  };
});

export default resolver.getDefinitions();

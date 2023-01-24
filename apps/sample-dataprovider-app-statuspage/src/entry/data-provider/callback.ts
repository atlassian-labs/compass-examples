import { CallbackPayload } from './types';
import { serverResponse } from '../../utils/webtrigger-utils';

// This runs after dataProvider is invoked
// https://developer.atlassian.com/cloud/compass/integrations/create-a-data-provider-app/#adding-a-callback-function
export const callback = (input: CallbackPayload) => {
  const { success, errorMessage } = input;

  if (!success) {
    console.error({
      message: 'Error processing dataProvider module',
      errorMessage,
    });
  }

  return serverResponse('Callback finished');
};

import resolver from './resolvers';
import processStatuspageIncidentEvent from './entry/webtriggers/process-statuspage-incident-event';
import { dataProvider } from './entry/data-provider/index';
import { callback } from './entry/data-provider/callback';

// Custom UI backend
export { resolver };

// webtriggers
export { processStatuspageIncidentEvent };

// dataProvider
export { dataProvider, callback };

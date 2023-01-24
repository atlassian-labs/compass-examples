import fetch, { enableFetchMocks } from 'jest-fetch-mock';

export const storage = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  query: jest.fn(),
  setSecret: jest.fn(),
  getSecret: jest.fn(),
  deleteSecret: jest.fn(),
};

export const startsWith = jest.fn().mockImplementation(() => {
  return {
    condition: 'STARTS_WITH',
    value: '',
  };
});

export const webTrigger = {
  getUrl: jest.fn(),
};

// This function is used to mock Forge's fetch API by using the mocked version
// of `fetch` provided in the jest-fetch-mock library.
// eslint-disable-next-line import/prefer-default-export
export const mockForgeApi = (): void => {
  const requestGraph = jest.fn();

  // Global API mock
  (global as any).api = {
    asApp: () => ({
      requestGraph,
    }),
  };

  jest.mock('@forge/api', () => ({
    __esModule: true,
    default: 'mockedDefaultExport',
    fetch, // assign the fetch import to return the jest-fetch-mock version of fetch
    storage,
    webTrigger,
    startsWith,
  }));
  enableFetchMocks(); // enable jest-fetch-mock
};

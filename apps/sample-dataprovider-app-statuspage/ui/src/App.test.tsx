import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { invoke as realInvoke } from '@forge/bridge';
import App from './App';

jest.mock('@forge/bridge', () => ({
  invoke: jest.fn(),
}));

const invoke: jest.Mock = realInvoke as any;

const defaultMocks: { [key: string]: any } = {
  getText: null,
};

const mockInvoke = (mocks = defaultMocks) => {
  invoke.mockImplementation(async (key) => {
    if (mocks[key] instanceof Error) {
      throw mocks[key];
    }

    return mocks[key];
  });
};

describe('Admin page', () => {
  beforeEach(() => {
    invoke.mockReset();
  });

  it('renders app disconnected state', async () => {
    mockInvoke({
      isAPIKeyConnected: {
        isConnected: false,
      },
    });
    const { findByText } = render(<App />);
    expect(await findByText('API Token')).toBeDefined();
  });

  it('renders app connected state', async () => {
    mockInvoke({
      isAPIKeyConnected: {
        isConnected: false,
      },
      validateAndConnectAPIKey: {
        appId: 'abc',
        cloudId: '123',
        success: true,
      },
    });
    const { findByText } = render(<App />);
    const submitButton = await findByText('Submit');
    submitButton.click();
    expect(await findByText('You are connected')).toBeDefined();
  });
});

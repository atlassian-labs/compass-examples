import { useState, useEffect } from 'react';
import Form, { FormFooter, FormHeader } from '@atlaskit/form';
import ButtonGroup from '@atlaskit/button/button-group';
import LoadingButton from '@atlaskit/button/loading-button';
import Button from '@atlaskit/button/standard-button';
import { invoke } from '@forge/bridge';
import { FormWrapper, Centered } from './styles';
import { APITokenField } from './APITokenField';
import { EmailField } from './EmailField';

function App() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onSubmit = (data: any) => {
    invoke<{ success: boolean }>('validateAndConnectAPIKey', data).then((respData) => {
      setIsConnected(respData.success);
    });
  };

  useEffect(() => {
    invoke<{ isConnected: boolean }>('isAPIKeyConnected').then((respData) => {
      setIsConnected(respData.isConnected);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isConnected ? (
    <Centered>
      <div>You are connected</div>
      <Button
        onClick={() => {
          invoke('disconnectAPIKey').then(() => {
            setIsConnected(false);
          });
        }}
      >
        Disconnect
      </Button>
    </Centered>
  ) : (
    <Centered>
      <FormWrapper>
        <Form onSubmit={onSubmit}>
          {({ formProps, submitting }) => (
            <form {...formProps}>
              <FormHeader>Connect to your Statuspage account.</FormHeader>
              <div>Only active, paid public pages are supported at this time.</div>
              <div>The email field will be used to confirm webhook subscriptions.</div>
              <APITokenField />
              <EmailField />
              <FormFooter>
                <ButtonGroup>
                  <LoadingButton type='submit' appearance='primary' isLoading={submitting}>
                    Submit
                  </LoadingButton>
                </ButtonGroup>
              </FormFooter>
            </form>
          )}
        </Form>
      </FormWrapper>
    </Centered>
  );
}

export default App;

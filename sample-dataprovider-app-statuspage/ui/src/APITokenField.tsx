import { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';

export const APITokenField = () => (
  <div>
    <Field aria-required={true} name='apiKey' defaultValue='' label='API Token' isRequired>
      {({ fieldProps }) => <TextField {...fieldProps} />}
    </Field>
  </div>
);

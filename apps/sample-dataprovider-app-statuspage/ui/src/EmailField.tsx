import { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';

export const EmailField = () => (
  <div>
    <Field aria-required={true} name='email' defaultValue='' label='Email' isRequired>
      {({ fieldProps }) => <TextField {...fieldProps} />}
    </Field>
  </div>
);

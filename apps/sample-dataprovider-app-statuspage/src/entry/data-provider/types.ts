type DataProviderPayload = {
  url: string;
  ctx: {
    cloudId: string;
    extensionId: string;
  };
};

type CallbackPayload = {
  success: boolean;
  url: string;
  errorMessage?: string;
};

export { DataProviderPayload, CallbackPayload };

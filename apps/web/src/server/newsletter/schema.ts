/** Outcome of the subscription form. Never carries an error object or stack. */
export interface SubscribeResult {
  success: boolean;
  message: string;
}

/** Validator for the POST server function: the submitted `<form>` data. */
export function subscribeInput(data: FormData): FormData {
  if (!(data instanceof FormData)) {
    throw new Error("Expected form data");
  }
  return data;
}

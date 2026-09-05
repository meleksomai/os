/** Outcome of the subscription form. Never carries an error object or stack. */
export interface SubscribeResult {
  success: boolean;
  message: string;
}

/** Outcome of a form submission. Never carries an error object or stack. */
export interface ActionResult {
  success: boolean;
  message: string;
}

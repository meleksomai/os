/** Validator for POST server functions that receive a submitted `<form>`. */
export function assertFormData(data: FormData): FormData {
  if (!(data instanceof FormData)) {
    throw new Error("Expected form data");
  }
  return data;
}

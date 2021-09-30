export interface NightfallError {
  code: number;
  message: string;
  description: string;
  additionalData: { [key: string]: string };
}

export class NightfallResponse<T> {
  // The success response
  data?: T

  // Indicates whether the API call returned an error
  isError: boolean = false

  // Represents the actual error response from the Nightfall API
  private error?: NightfallError

  constructor(data?: T) {
    if (data) this.data = data
  }

  setError(error: NightfallError) {
    this.isError = true
    this.error = error
  }

  getError() {
    return this.error
  }
}
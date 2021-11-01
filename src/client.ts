import { FileScanner } from "./filesScanner"

export class Client {
  protected readonly API_HOST = 'https://api.nightfall.ai'
  protected readonly API_KEY: string = ''
  protected readonly AXIOS_HEADERS: { [key: string]: string } = {}

  // Expose the file scanner internally
  protected fileScanner: FileScanner

  constructor(apiKey: string) {
    this.API_KEY = apiKey

    // Set Axios request headers since we will reuse this quite a lot
    this.AXIOS_HEADERS = {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      "User-Agent": "nightfall-nodejs-sdk/1.0.0"
    }

    // Initialize the file scanner
    this.fileScanner = new FileScanner(this.AXIOS_HEADERS)
  }

  /**
   * A helpder function to determine whether the error is a generic JavaScript error or a
   * Nightfall API error.
   * 
   * @param error The error object
   * @returns A boolean that indicates if the error is a Nightfall error
   */
  protected isNightfallError(error: any): boolean {
    if (error.hasOwnProperty('isAxiosError') && error.isAxiosError && error.response.data.hasOwnProperty('code')) {
      return true
    }

    return false
  }
}

export class Base {
  protected readonly API_HOST = 'https://api.nightfall.ai'
  protected readonly API_KEY: string = ''
  protected readonly AXIOS_HEADERS: { [key: string]: string | number } = {}

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.hasOwnProperty('NIGHTFALL_API_KEY')) {
      throw new Error('Please provide an API Key or configure your key as an environment variable.')
    }

    this.API_KEY = apiKey || process.env.NIGHTFALL_API_KEY as string

    // Set Axios request headers since we will reuse this quite a lot
    this.AXIOS_HEADERS = {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      "User-Agent": "nightfall-nodejs-sdk/1.0.0"
    }
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

import { Config } from "./types"

// Default environment variables
export const ENV_API_KEY = 'NIGHTFALL_API_KEY'
export const ENV_WEBHOOK_SIGNING_SECRET = 'NIGHTFALL_WEBHOOK_SIGNING_SECRET'

export class Base {
  protected readonly API_HOST = 'https://api.nightfall.ai'
  protected readonly API_KEY: string = ''
  protected readonly WEBHOOK_SIGNING_SECRET: string = ''
  protected readonly AXIOS_HEADERS: { [key: string]: string | number } = {}

  constructor(config?: Config) {
    // Set API Key
    if (!config?.apiKey && !process.env.hasOwnProperty(ENV_API_KEY)) {
      throw new Error('Please provide an API Key or configure your key as an environment variable.')
    }

    this.API_KEY = config?.apiKey || process.env[ENV_API_KEY] as string

    // Set webhook signing secret if supplied
    if (config?.webhookSigningSecret) {
      this.WEBHOOK_SIGNING_SECRET = config.webhookSigningSecret
    }

    // Attempt to set webhook signing secret from env if not supplied in config
    if (!config?.webhookSigningSecret && process.env.hasOwnProperty(ENV_WEBHOOK_SIGNING_SECRET)) {
      this.WEBHOOK_SIGNING_SECRET = process.env[ENV_WEBHOOK_SIGNING_SECRET] as string
    }

    // Set Axios request headers since we will reuse this quite a lot
    this.AXIOS_HEADERS = {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      "User-Agent": "nightfall-nodejs-sdk/1.1.0"
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
    if (
      error.hasOwnProperty('isAxiosError')
      && error.isAxiosError
      && error.response.data.hasOwnProperty('code')
      && error.response.data.hasOwnProperty('message')
    ) {
      return true
    }

    return false
  }
}

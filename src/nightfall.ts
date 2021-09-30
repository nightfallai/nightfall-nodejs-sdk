import axios, { AxiosError } from 'axios'
import { NightfallResponse, NightfallError, ScanText } from './types'

export class Nightfall {
  private readonly API_HOST = 'https://api.nightfall.ai'
  private readonly API_KEY: string = ''
  private readonly AXIOS_HEADERS: { [key: string]: string } = {}

  /**
   * Create an instance of the Nightfall client.
   * 
   * @param {string} apiKey Your Nightfall API key
   */
  constructor(apiKey: string) {
    this.API_KEY = apiKey

    // Set Axios request headers since we will reuse this quite a lot
    this.AXIOS_HEADERS = {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Content-Type': 'application/json',
      "User-Agent": "nightfall-nodejs-sdk/1.0.0"
    }
  }

  /**
   * Provide a list of arbitrary string data, and scan each item with the provided detectors
   * to uncover sensitive information. Returns a list equal in size to the number of provided
   * string payloads. The item at each list index will be a list of all matches for the provided
   * detectors, or an empty list if no occurrences are found.
   * 
   * @param payload An array of strings that you would like to scan
   * @param config The configuration to use to scan the payload
   * @returns {Promise} A promise object representing the Nightfall response
   */
  async scanText(payload: string[], config: ScanText.RequestConfig): Promise<NightfallResponse<ScanText.Response>> {
    try {
      const response = await axios.post<ScanText.Response>(
        `${this.API_HOST}/v3/scan`,
        { payload, config },
        { headers: this.AXIOS_HEADERS },
      )

      return Promise.resolve(new NightfallResponse<ScanText.Response>(response.data))
    } catch (error) {
      if (this.isNightfallError(error)) {
        const axiosError = error as AxiosError<NightfallError>
        const errorResponse = new NightfallResponse<ScanText.Response>()
        errorResponse.setError(axiosError.response?.data as NightfallError)
        return Promise.resolve(errorResponse)
      }

      return Promise.reject(error)
    }
  }

  /**
   * A helpder function to determine whether the error is a generic JavaScript error or a
   * Nightfall API error.
   * 
   * @param {Object} error The error object
   * @returns {boolean} A boolean that indicates if the error is a Nightfall error
   */
  private isNightfallError(error: any): boolean {
    if (error.hasOwnProperty('isAxiosError') && error.isAxiosError && error.response.data.hasOwnProperty('code')) {
      return true
    }

    return false
  }
}

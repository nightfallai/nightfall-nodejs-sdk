import axios, { AxiosError } from 'axios'
import { Client } from './client'
import { FileScanner } from './filesScanner'
import { NightfallResponse, NightfallError, ScanText, ScanFile } from './types'

export class Nightfall extends Client {
  /**
   * Create an instance of the Nightfall client.
   * 
   * @param apiKey Your Nightfall API key
   */
  constructor(apiKey: string) {
    super(apiKey)
  }

  /**
   * Provide a list of arbitrary string data, and scan each item with the provided detectors
   * to uncover sensitive information. Returns a list equal in size to the number of provided
   * string payloads. The item at each list index will be a list of all matches for the provided
   * detectors, or an empty list if no occurrences are found.
   * 
   * @param payload An array of strings that you would like to scan
   * @param config The configuration to use to scan the payload
   * @returns A promise object representing the Nightfall response
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

  async scanFile(filePath: string): Promise<NightfallResponse<ScanFile.InitializeResponse>> {
    try {
      const InitializeResponse = await this.fileScanner.initialize(filePath)

      return Promise.resolve(new NightfallResponse<ScanFile.InitializeResponse>(InitializeResponse.data))
    } catch (error) {
      if (this.isNightfallError(error)) {
        const axiosError = error as AxiosError<NightfallError>
        const errorResponse = new NightfallResponse<ScanFile.InitializeResponse>()
        errorResponse.setError(axiosError.response?.data as NightfallError)
        return Promise.resolve(errorResponse)
      }

      return Promise.reject(error)
    }
  }
}

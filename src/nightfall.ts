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
   * @returns A promise that contains the API response
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
   * A utility method that wraps the four steps related to uploading and scanning files.
   * 
   * @see https://docs.nightfall.ai/docs/scanning-files
   * 
   * @param filePath The path of the file that you wish to scan
   * @returns A promise that contains the API response
   */
  async scanFile(filePath: string): Promise<NightfallResponse<ScanFile.FinishUploadResponse>> {
    try {
      const fileScanner = new FileScanner(this.API_KEY, filePath)
      await fileScanner.initialize()
      await fileScanner.uploadChunks()
      const response = await fileScanner.finish()

      return Promise.resolve(new NightfallResponse<ScanFile.FinishUploadResponse>(response.data))
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

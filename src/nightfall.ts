import axios, { AxiosError } from 'axios'
import { Base } from './base'
import { FileScanner } from './filesScanner'
import { NightfallResponse, NightfallError, ScanText, ScanFile } from './types'

export class Nightfall extends Base {
  /**
   * Create an instance of the Nightfall client. Although you can supply
   * your API key manually when you initiate the client, we recommend that
   * you configure your API key as an environment variable named
   * NIGHTFALL_API_KEY. The client automatically reads `process.env.NIGHTFALL_API_KEY`
   * when you initiate the client like so: `const client = new Nightfall()`.
   * 
   * @param apiKey Your Nightfall API key
   */
  constructor(apiKey?: string) {
    apiKey ? super(apiKey) : super()
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
   * As the underlying file might be arbitrarily large, this scan is conducted
   * asynchronously. Results from the scan are delivered to the webhook URL provided in
   * the request.
   * 
   * @see https://docs.nightfall.ai/docs/scanning-files
   * 
   * @param filePath The path of the file that you wish to scan
   * @param policy An object containing the scan policy
   * @returns A promise that contains the API response
   */
  async scanFile(filePath: string, policy: ScanFile.RequestPolicy): Promise<NightfallResponse<ScanFile.ScanResponse>> {
    try {
      const fileScanner = new FileScanner(filePath)
      await fileScanner.initialize()
      await fileScanner.uploadChunks()
      await fileScanner.finish()
      const response = await fileScanner.scan(policy)

      return Promise.resolve(new NightfallResponse<ScanFile.ScanResponse>(response.data))
    } catch (error) {
      if (this.isNightfallError(error)) {
        const axiosError = error as AxiosError<NightfallError>
        const errorResponse = new NightfallResponse<ScanFile.ScanResponse>()
        errorResponse.setError(axiosError.response?.data as NightfallError)
        return Promise.resolve(errorResponse)
      }

      return Promise.reject(error)
    }
  }
}

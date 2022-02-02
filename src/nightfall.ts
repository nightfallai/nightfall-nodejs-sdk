import axios, { AxiosError } from 'axios'
import crypto from 'crypto'
import { Base } from './base'
import { FileScanner } from './filesScanner'
import {
  Config, NightfallResponse, NightfallError, ScanText, ScanFile
} from './types'

export class Nightfall extends Base {
  /**
   * Create an instance of the Nightfall client. Although you can supply your API key and webhook signing secret
   * manually when you initiate the client, we recommend that you configure them as an environment variables named
   * `NIGHTFALL_API_KEY` and `NIGHTFALL_WEBHOOK_SIGNING_SECRET`. The client automatically reads
   * `process.env.NIGHTFALL_API_KEY` and `process.env.NIGHTFALL_WEBHOOK_SIGNING_SECRET` when you initiate the
   * client like so: `const client = new Nightfall()`.
   * 
   * @param {Object} config An optional object to initialise the client with your key manually
   * @param {string} config.apiKey Your Nightfall API Key
   * @param {string} config.webhookSigningSecret Your webhook signing secret
   */
  constructor(config?: Config) {
    super(config)
  }

  /**
   * Provide a list of arbitrary string data, and scan each item with the provided detectors
   * to uncover sensitive information. Returns a list equal in size to the number of provided
   * string payloads. The item at each list index will be a list of all matches for the provided
   * detectors, or an empty list if no occurrences are found.
   *
   * @param payload An array of strings that you would like to scan
   * @param policy The configuration to use to scan the payload
   * @param policyUUIDs An array of UUIDs referring to policies built through the Nightfall dashboard
   * @returns A promise that contains the API response
   */
  async scanText(payload: string[], policy?: ScanText.RequestConfig, policyUUIDs?: string[]): Promise<NightfallResponse<ScanText.Response>> {
    try {
      const response = await axios.post<ScanText.Response>(
        `${this.API_HOST}/v3/scan`,
        { payload, policy },
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
   * @param requestMetadata Optional - A string containing arbitrary metadata. You may opt to use
   *                        this to help identify your input file upon receiving a webhook response.
   *                        Maximum length 10 KB.
   * @returns A promise that contains the API response
   */
  async scanFile(filePath: string, policy: ScanFile.ScanPolicy, requestMetadata?: string): Promise<NightfallResponse<ScanFile.ScanResponse>> {
    try {
      const fileScanner = new FileScanner(
        {
          apiKey: this.API_KEY,
          webhookSigningSecret: this.WEBHOOK_SIGNING_SECRET,
        },
        filePath,
      )
      await fileScanner.initialize()
      await fileScanner.uploadChunks()
      await fileScanner.finish()
      const response = await fileScanner.scan(policy, requestMetadata)

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

  /**
   * A helper method to validate incoming webhook requests from Nightfall. In order to use this method, you
   * must initialize the Nightfall client with your `webhookSigningSecret` or declare your signing secret as
   * an environment variable called `NIGHTFALL_WEBHOOK_SIGNING_SECRET`. For more information,
   * visit https://docs.nightfall.ai/docs/creating-a-webhook-server#webhook-signature-verification.
   * 
   * @param requestBody The webhook request body
   * @param requestSignature The value of the X-Nightfall-Signature header
   * @param requestTimestamp The value of the X-Nightfall-Timestamp header
   * @param threshold Optional - The threshold in seconds. Defaults to 300 seconds (5 minutes).
   * @returns A boolean that indicates whether the webhook is valid
   */
  validateWebhook(requestBody: ScanFile.WebhookBody, requestSignature: string, requestTimestamp: number, threshold?: number): boolean {
    // Do not continue if the client isn't initialized with a webhook signing secret
    if (!this.WEBHOOK_SIGNING_SECRET && !process.env.hasOwnProperty('NIGHTFALL_WEBHOOK_SIGNING_SECRET')) {
      throw new Error('Please initialize the Nightfall client with a webhook signing secret or configure your signing secret as an environment variable.')
    }

    // First verify that the request occurred recently (before the configured threshold time)
    // to protect against replay attacks
    const defaultThreshold = threshold || 300
    const now = Math.round(new Date().getTime() / 1000)
    const thresholdTimestamp = now - defaultThreshold
    if (requestTimestamp < thresholdTimestamp || requestTimestamp > now) {
      return false
    }

    // Validate request signature using the signing secret
    const hashPayload = `${requestTimestamp}:${JSON.stringify(requestBody)}`
    const computedSignature = crypto.createHmac('sha256', this.WEBHOOK_SIGNING_SECRET).update(hashPayload).digest('hex')

    return computedSignature === requestSignature
  }
}

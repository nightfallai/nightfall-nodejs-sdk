import axios, { AxiosResponse } from "axios"
import fs from 'fs'
import { Base } from './base'
import { Config, ScanFile } from './types'

export class FileScanner extends Base {
  filePath: string
  fileId: string = ''
  chunkSize: number = 0

  /**
   * Create an instance of the FileScanner helper.
   * 
   * @param filePath The path of the file that needs to be scanned
   */
  constructor(config: Config, filePath: string) {
    super(config)
    this.filePath = filePath
  }

  /**
   * Reads the file from disk and creates a new file upload session. If this operation
   * returns successfully, the ID returned as part of the response object shall be used
   * to refer to the file in all subsequent upload and scanning operations.
   * 
   * @returns A promise representing the Nightfall response
   */
  async initialize(): Promise<AxiosResponse<ScanFile.InitializeResponse>> {
    try {
      // Get the file size and mime type
      const stats = fs.statSync(this.filePath)

      // Call API
      const response = await axios.post<ScanFile.InitializeResponse>(
        `${this.API_HOST}/v3/upload`,
        {
          fileSizeBytes: stats.size,
        },
        { headers: this.AXIOS_HEADERS },
      )

      // Save file ID and chunk size
      this.fileId = response.data.id
      this.chunkSize = response.data.chunkSize

      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Read the file, break it up into chunks and upload each chunk.
   */
  async uploadChunks() {
    try {
      // Read the file in chunks
      const stream = fs.createReadStream(this.filePath, {
        highWaterMark: this.chunkSize,
        encoding: 'utf8'
      })

      // Upload chunks
      let uploadOffset = 0

      for await (const chunk of stream) {
        await axios.patch(`${this.API_HOST}/v3/upload/${this.fileId}`, chunk, {
          headers: {
            ...this.AXIOS_HEADERS,
            'Content-Type': 'application/octet-stream',
            'X-Upload-Offset': uploadOffset
          }
        })

        uploadOffset += this.chunkSize
      }

      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Marks an upload as 'finished' once all the chunks are uploaded.
   * This step is necessary to begin scanning.
   * 
   * @returns A promise representing the API response
   */
  async finish(): Promise<AxiosResponse<ScanFile.FinishUploadResponse>> {
    try {
      const response = await axios.post<ScanFile.FinishUploadResponse>(
        `${this.API_HOST}/v3/upload/${this.fileId}/finish`,
        {},
        { headers: this.AXIOS_HEADERS }
      )

      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Triggers a scan of the uploaded file.
   * 
   * @param policy An object containing the scan policy
   * @param requestMetadata The optional request metadata
   * @returns A promise representing the API response
   */
  async scan(policy: ScanFile.ScanPolicy, requestMetadata?: string): Promise<AxiosResponse<ScanFile.ScanResponse>> {
    try {
      // Only send the requestMetadata if provided
      const data: ScanFile.ScanRequest = { policy }
      if (requestMetadata) {
        data.requestMetadata = requestMetadata
      }

      const response = await axios.post<ScanFile.ScanResponse>(
        `${this.API_HOST}/v3/upload/${this.fileId}/scan`,
        data,
        { headers: this.AXIOS_HEADERS },
      )

      return Promise.resolve(response)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

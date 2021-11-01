import axios, { AxiosResponse } from "axios"
import fs from 'fs'
import { Client } from './client'
import { ScanFile } from './types'

export class FileScanner extends Client {
  filePath: string
  fileId: string = ''
  chunkSize: number = 0

  /**
   * Create an instance of the FileScanner helper.
   * 
   * @param filePath The path of the file that needs to be scanned
   * @param apiKey Your Nightfall API key
   */
  constructor(apiKey: string, filePath: string) {
    super(apiKey)
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

      // Call Nightfall API
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

  async uploadChunks() {
    try {
      // Read the file in chunks
      const stream = fs.createReadStream(this.filePath, {
        highWaterMark: this.chunkSize,
        encoding: 'utf8'
      })

      // Upload chunks
      const headers = this.AXIOS_HEADERS
      headers['Content-Type'] = 'application/octet-stream'

      let uploadOffset = 0

      stream.on('data', async (chunk) => {
        await axios.patch(`${this.API_HOST}/v3/upload/${this.fileId}`, chunk, {
          headers: {
            ...headers,
            'X-Upload-Offset': uploadOffset
          }
        })

        uploadOffset += this.chunkSize
      })

      // Mark as completed
      stream.on('close', () => {
        console.log('========')
        console.log('File uploaded')
        console.log('File ID:', this.fileId)
      })

      return Promise.resolve()
    } catch (error) {
      return Promise.reject()
    }
  }
}

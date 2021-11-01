import axios, { AxiosError, AxiosResponse } from "axios"
import fs from 'fs'
import { ScanFile } from './types'

export class FileScanner {
  private readonly API_HOST = 'https://api.nightfall.ai'
  private readonly AXIOS_HEADERS: { [key: string]: string } = {}

  constructor(axiosHeaders: { [key: string]: string }) {
    this.AXIOS_HEADERS = axiosHeaders
  }

  /**
   * Reads the file from disk and creates a new file upload session. If this operation
   * returns successfully, the ID returned as part of the response object shall be used
   * to refer to the file in all subsequent upload and scanning operations.
   * 
   * @param filePath The path of the file that needs to be scanned
   * @returns A promise representing the Nightfall response
   */
  async initialize(filePath: string): Promise<AxiosResponse<ScanFile.InitializeResponse>> {
    try {
      // Get the file size and mime type
      const stats = fs.statSync(filePath)

      // Call Nightfall API
      return await axios.post<ScanFile.InitializeResponse>(
        `${this.API_HOST}/v3/upload`,
        {
          fileSizeBytes: stats.size,
        },
        { headers: this.AXIOS_HEADERS },
      )
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

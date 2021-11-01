export namespace ScanFile {
  export interface InitializeRequest {
    fileSizeBytes: number
    mimeType?: string
  }

  export interface InitializeResponse {
    id: string,
    fileSizeBytes: number,
    chunkSize: number,
    mimeType: string
  }
}
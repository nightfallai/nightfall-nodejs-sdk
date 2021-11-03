import { Detector } from ".";

export namespace ScanFile {
  export interface ScanRequest {
    policy: ScanPolicy
    requestMetadata?: string
  }

  export interface ScanPolicy {
    detectionRuleUUIDs?: string[]
    detectionRules?: Detector.Rule[]
    webhookURL: string
  }

  export interface InitializeResponse {
    id: string
    fileSizeBytes: number
    chunkSize: number
    mimeType: string
  }

  export interface FinishUploadResponse {
    id: string,
    fileSizeBytes: number
    chunkSize: number
    mimeType: string
  }

  export interface ScanResponse {
    id: string
    message: string
  }
}

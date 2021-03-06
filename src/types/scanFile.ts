import { Alerts, Detector, NightfallError } from ".";

export namespace ScanFile {
  export interface ScanRequest {
    policy: ScanPolicy
    requestMetadata?: string
  }

  export interface ScanPolicy {
    detectionRuleUUIDs?: string[]
    detectionRules?: Detector.Rule[]
    webhookURL?: string // Deprecated, use alertConfig instead
    alertConfig?: Alerts.Config
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

  export interface WebhookBody {
    findingsURL: string;
    validUntil: string;
    uploadID: string;
    findingsPresent: boolean;
    requestMetadata: string;
    errors: NightfallError[];
  }
}

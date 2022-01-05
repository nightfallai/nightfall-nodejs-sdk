import { Detector } from ".";

export namespace ScanText {
  export interface RequestConfig {
    detectionRuleUUIDs?: string[]
    detectionRules?: Detector.Rule[]
    contextBytes?: number
    defaultRedactionConfig?: Detector.RedactionConfig
  }

  export interface Response {
    findings: Finding[][]
    redactedPayload: string[]
  }

  export interface Finding {
    finding: string
    redactedFinding?: string
    beforeContext?: string
    afterContext?: string
    detector: {
      name: string
      uuid: string
    };
    confidence: string
    location: {
      byteRange: FindingRange
      codepointRange: FindingRange
    };
    redactedLocation?: {
      byteRange: FindingRange
      codepointRange: FindingRange
    }
    matchedDetectionRuleUUIDs: any[]
    matchedDetectionRules: string[]
  }

  type FindingRange = {
    start: number
    end: number
  }
}

import { Detector } from ".";

export namespace ScanText {
  export interface RequestConfig {
    detectionRuleUUIDs?: string[]
    detectionRules?: DetectionRule[]
  }

  export interface DetectionRule {
    detectors: Detector.Properties[]
    name: string
    logicalOp: 'ANY' | 'ALL'
  }

  export interface Response {
    findings: Finding[][]
    redactedPayload: string[]
  }

  export interface Finding {
    finding: string;
    detector: {
      name: string;
      uuid: string;
    };
    confidence: string;
    location: {
      byteRange: FindingRange;
      codepointRange: FindingRange;
    };
    matchedDetectionRuleUUIDs: any[];
    matchedDetectionRules: string[];
  }

  type FindingRange = {
    start: number;
    end: number;
  }
}
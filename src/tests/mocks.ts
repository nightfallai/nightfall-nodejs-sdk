import { Detector, ScanText } from "../types"

// Requests
export const creditCardPayload = ['My credit card number is 4242424242424242']
export const creditCardConfig: ScanText.RequestConfig = {
  detectionRules: [
    {
      name: 'Find credit cards',
      logicalOp: 'ANY',
      detectors: [
        {
          detectorType: Detector.Type.Nightfall,
          nightfallDetector: 'CREDIT_CARD_NUMBER',
          minNumFindings: 1,
          minConfidence: Detector.Confidence.Likely,
          displayName: 'Credit Card Number'
        }
      ],
    }
  ]
}

// Responses
export const errorResponse = {
  code: 40015,
  message: 'Invalid Request',
  description: "detectionRuleUUIDs and detectionRules can't both be empty",
  additionalData: {
    "InspectRequest.Config.DetectionRuleUUIDs": "at least one of (DetectionRuleUUIDs or DetectionRules) must have length greater than 0",
    "InspectRequest.Config.DetectionRules": "at least one of (DetectionRuleUUIDs or DetectionRules) must have length greater than 0"
  },
}

export const scanTextResponse = {
  "findings": [
    [
      {
        "finding": "4242424242424242",
        "detector": {
          "name": "Credit Card Number",
          "uuid": "74c1815e-c0c3-4df5-8b1e-6cf98864a454"
        },
        "confidence": "LIKELY",
        "location": {
          "byteRange": {
            "start": 25,
            "end": 41
          },
          "codepointRange": {
            "start": 25,
            "end": 41
          },
          "commitHash": "",
        },
        "matchedDetectionRuleUUIDs": [],
        "matchedDetectionRules": [
          "Find credit cards"
        ]
      }
    ]
  ],
  "redactedPayload": [
    ""
  ]
}

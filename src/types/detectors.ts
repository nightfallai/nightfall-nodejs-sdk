export namespace Detector {
  export enum MinConfidence {
    VeryUnlikely = 'VERY_UNLIKELY',
    Unlikely = 'UNLIKELY',
    Possible = 'POSSIBLE',
    Likely = 'LIKELY',
    VeryLikely = 'VERY_LIKELY'
  }

  export enum Type {
    Nightfall = 'NIGHTFALL_DETECTOR',
    Regex = 'REGEX',
    WordList = 'WORD_LIST'
  }

  export interface Properties {
    minNumFindings: number
    minConfidence: MinConfidence | string
    displayName: string
    detectorType: Type | string
    nightfallDetector: string
  }
}

export namespace Detector {
  export enum Confidence {
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

  type Regex = {
    pattern: string
    isCaseSensitive: boolean
  }

  type WordList = {
    values: string[]
    isCaseSensitive: boolean
  }

  type ContextRule = {
    regex: Regex
    proximity: {
      windowBefore: number
      windowAfter: number
    }
    confidenceAdjustment: Confidence
  }

  type ExclusionRule = {
    matchType: 'PARTIAL' | 'FULL'
    exclusionType: Type.Regex | Type.WordList
    regex?: Regex
    wordList?: WordList
  }

  export interface RedactionConfig {
    maskConfig?: MaskConfig;
    infoTypeSubstitutionConfig?: { [key: string]: string };
    substitutionConfig?: SubstitutionConfig;
    cryptoConfig?: CryptoConfig;
    removeFinding?: boolean;
  }

  export interface MaskConfig {
    charsToIgnore: string[];
    maskingChar: string;
    numCharsToLeaveUnmasked: number;
    maskLeftToRight: boolean;
  }

  export interface SubstitutionConfig {
    substitutionPhrase: string;
  }

  export interface CryptoConfig {
    publicKey: string;
  }

  export interface Properties {
    minNumFindings: number
    minConfidence: Confidence | string
    detectorUUID?: string,
    displayName: string
    detectorType: Type | string
    nightfallDetector?: string
    regex?: Regex
    wordList?: WordList
    contextRules?: ContextRule[]
    exclusionRules?: ExclusionRule[]
    redactionConfig?: RedactionConfig
  }

  export interface Rule {
    detectors: Properties[]
    name: string
    logicalOp: 'ANY' | 'ALL'
  }
}

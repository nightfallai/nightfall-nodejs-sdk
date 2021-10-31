import { Nightfall } from '../nightfall'
import { creditCardConfig, creditCardPayload, errorResponse } from './mocks'

describe('should test the text scanning method', () => {
  // Set API key and other dependencies
  if (!process.env.NIGHTFALL_API_KEY) {
    throw new Error("NIGHTFALL_API_KEY environment variable is required")
  }

  const apiKey = process.env.NIGHTFALL_API_KEY

  // Run tests
  it('should create a new nightfall client and check if the scanText method exists', () => {
    const client = new Nightfall(apiKey)

    expect(client).toBeDefined()
    expect(typeof client.scanText).toBe('function')
  })

  it('should return an error if the request was configured incorrectly', async () => {
    const client = new Nightfall(apiKey)
    const scanTextSpy = jest.spyOn(client, 'scanText')

    const response = await client.scanText(creditCardPayload, {})
    expect(scanTextSpy).toHaveBeenCalledWith(creditCardPayload, {})
    expect(response.data).toBeUndefined()
    expect(response.isError).toBe(true)
    const error = response.getError()
    expect(error).toEqual(errorResponse)
  })

  it('should return findings', async () => {
    const client = new Nightfall(apiKey)
    const scanTextSpy = jest.spyOn(client, 'scanText')

    const response = await client.scanText(creditCardPayload, creditCardConfig)
    expect(scanTextSpy).toHaveBeenCalledWith(creditCardPayload, creditCardConfig)
    expect(response.isError).toBe(false)
    expect(response.data).toBeDefined()
    expect(response.data).toHaveProperty('findings')
    expect(response.data?.findings).toHaveLength(1)
  })
})

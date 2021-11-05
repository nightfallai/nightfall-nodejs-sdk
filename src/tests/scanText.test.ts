import { Nightfall } from '../nightfall'
import { creditCardConfig, creditCardPayload, errorResponse } from './mocks'

describe('should test the text scanning method', () => {
  // Run tests
  it('should create a new nightfall client and check if the scanText method exists', () => {
    const client = new Nightfall()

    expect(client).toBeDefined()
    expect(typeof client.scanText).toBe('function')
  })

  it('should return an error if the request was configured incorrectly', async () => {
    const client = new Nightfall()
    const scanTextSpy = jest.spyOn(client, 'scanText')

    const response = await client.scanText(creditCardPayload, {})
    expect(scanTextSpy).toHaveBeenCalledWith(creditCardPayload, {})
    expect(response.data).toBeUndefined()
    expect(response.isError).toBe(true)
    const error = response.getError()
    expect(error).toEqual(errorResponse)
  })

  it('should return findings', async () => {
    const client = new Nightfall()
    const scanTextSpy = jest.spyOn(client, 'scanText')

    const response = await client.scanText(creditCardPayload, creditCardConfig)
    expect(scanTextSpy).toHaveBeenCalledWith(creditCardPayload, creditCardConfig)
    expect(response.isError).toBe(false)
    expect(response.data).toBeDefined()
    expect(response.data).toHaveProperty('findings')
    expect(response.data?.findings).toHaveLength(1)
  })
})

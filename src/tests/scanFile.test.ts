import axios from 'axios'
import path from 'path'
import MockAdapter from 'axios-mock-adapter'
import { ScanFile } from '../types'
import { Nightfall } from '../nightfall'

// Mock data
const API_HOST = 'https://api.nightfall.ai'
const FILE_PATH = path.join(__dirname, "./", "mySecrets.txt");
const IMAGE_FILE_PATH = path.join(__dirname, "./", "test-image.png");
const REQUEST_POLICY: ScanFile.ScanPolicy = {
  detectionRuleUUIDs: ['MOCK_RULE_UUID'],
  webhookURL: 'https://webhook.com'
}
const SCAN_RESPONSE: ScanFile.ScanResponse = {
  id: 'SCAN_ID',
  message: 'success'
}

// Mock Axios library
const mock = new MockAdapter(axios)

// Mock upload call
mock.onPost(`${API_HOST}/v3/upload`).reply(200, {
  id: 'FILE_ID',
  chunkSize: 5000
})

// Mock chunk call
mock.onPatch(`${API_HOST}/v3/upload/FILE_ID`).reply(200)

// Mock finish call
mock.onPost(`${API_HOST}/v3/upload/FILE_ID/finish`).reply(200)

// Mock scan call
mock.onPost(`${API_HOST}/v3/upload/FILE_ID/scan`).reply(200, SCAN_RESPONSE)

describe('should test the file scanning method', () => {
  it('should create a new nightfall client and check if the scanFile method exists', () => {
    const client = new Nightfall()

    expect(client).toBeDefined()
    expect(typeof client.scanFile).toBe('function')
  })

  it('test happy path', async () => {
    const nfClient = new Nightfall()
    const scanFileSpy = jest.spyOn(nfClient, 'scanFile')

    const response = await nfClient.scanFile(FILE_PATH, REQUEST_POLICY)
    expect(scanFileSpy).toHaveBeenCalledWith(FILE_PATH, REQUEST_POLICY)
    expect(response.data).toEqual(SCAN_RESPONSE)
    expect(response.isError).toBe(false)
  })

  it('test binary upload data', async () => {
    const nfClient = new Nightfall()
    const scanFileSpy = jest.spyOn(nfClient, 'scanFile')

    const response = await nfClient.scanFile(IMAGE_FILE_PATH, REQUEST_POLICY)
    expect(scanFileSpy).toHaveBeenCalledWith(IMAGE_FILE_PATH, REQUEST_POLICY)
    expect(response.data).toEqual(SCAN_RESPONSE)
    expect(response.isError).toBe(false)
  })

  it('test error path', async () => {
    // Reset mocks and force error response
    mock.reset()
    mock.onPost(`${API_HOST}/v3/upload`).reply(500, {
      code: 500,
      message: 'Unknown error'
    })

    // Init client and test call
    const nfClient = new Nightfall()
    const scanFileSpy = jest.spyOn(nfClient, 'scanFile')

    const response = await nfClient.scanFile(FILE_PATH, REQUEST_POLICY)
    expect(scanFileSpy).toHaveBeenCalledWith(FILE_PATH, REQUEST_POLICY)
    expect(response.isError).toBe(true)
  })
})

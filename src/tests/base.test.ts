import { Base, ENV_API_KEY } from '../base'

describe('base class', () => {
  const ENV_VARS = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ENV_VARS }
  })

  afterAll(() => {
    process.env = ENV_VARS
  })

  it('should error if the client is initialized without the api key', () => {
    // Delete API key from env
    delete process.env[ENV_API_KEY]

    // Init client and test error
    expect(() => {
      new Base()
    }).toThrowError('Please provide an API Key or configure your key as an environment variable.')
  })

  it('should not error if the api key is configured as an env var', () => {
    expect(() => { new Base() }).not.toThrowError()
  })
})

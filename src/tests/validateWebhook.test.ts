import { Nightfall } from '../nightfall'

const VALID_BODY = {
  findingsURL: 'https://nightfall.com/findings',
  validUntil: '2021-11-06T08:05:13.193904055Z',
  uploadID: 'MY_UPLOAD_ID',
  findingsPresent: true,
  requestMetadata: 'MY_SECRETS',
  errors: []
}

const VALID_SIGNATURE = 'f3c4db6aee74079e7ba09aee16f5b729beee45edf0eb8f77173dbb479f446bda'

describe('nightfall.validateWebhook()', () => {
  it('test happy path', () => {
    const client = new Nightfall({ webhookSigningSecret: 'MY_WEBHOOK_SECRET' })

    expect(client).toBeDefined()
    expect(typeof client.validateWebhook).toBe('function')

    const isValid = client.validateWebhook(
      VALID_BODY,
      VALID_SIGNATURE,
      1636099513,
      307584000 // Ten years
    )

    expect(isValid).toBeTruthy()
  })

  it('test request too old', () => {
    const client = new Nightfall({ webhookSigningSecret: 'MY_WEBHOOK_SECRET' })

    expect(client).toBeDefined()
    expect(typeof client.validateWebhook).toBe('function')

    const isValid = client.validateWebhook(
      VALID_BODY,
      VALID_SIGNATURE,
      1636099513,
    )

    expect(isValid).toBeFalsy()
  })

  it('test request timestamp in the future', () => {
    const client = new Nightfall({ webhookSigningSecret: 'MY_WEBHOOK_SECRET' })

    expect(client).toBeDefined()
    expect(typeof client.validateWebhook).toBe('function')

    const isValid = client.validateWebhook(
      VALID_BODY,
      VALID_SIGNATURE,
      Math.ceil(new Date().getTime() / 1000) + 300,
      307584000 // Ten years
    )

    expect(isValid).toBeFalsy()
  })

  it('test signature mismatch', () => {
    const client = new Nightfall({ webhookSigningSecret: 'MY_WEBHOOK_SECRET' })

    expect(client).toBeDefined()
    expect(typeof client.validateWebhook).toBe('function')

    const isValid = client.validateWebhook(
      VALID_BODY,
      'INVALID_SIGNATURE',
      1636099513,
      307584000 // Ten years
    )

    expect(isValid).toBeFalsy()
  })
})

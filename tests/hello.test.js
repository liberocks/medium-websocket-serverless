import * as hello from '../functions/hello'

test('hello', async () => {
  const event = 'event'
  const context = 'context'
  const callback = (error, response) => {
    expect(response.statusCode).toEqual(200)
    expect(typeof response.body).toBe('string')
  }

  await hello.handler(event, context, callback)
})

'use strict'

/* global describe, it */

const assert = require('assert')

const request = require('supertest')

const env = require('../../../environment')
const app = require('../../../src/app')(env)

describe('renders', () => {
  it('render fetch feature', () => {
    request(app)
      .post('/pf/render')
      .set('Content-Type', 'application/json')
      .send({
        rendering: [
          {
            collection: 'features',
            type: 'test/fetch',
            props: {}
          }
        ]
      })
      .end((_, res) => {
        assert.strictEqual(res.statusCode, 200)
        assert.strictEqual(res.text, '<!DOCTYPE html><html><head><title>Fusion Article</title><link rel="icon" type="image/x-icon" href="/pf/resources/favicon.ico?d=37"/></head><body><div id="fusion-app"><div>abc</div></div></body></html>')
      })
  })
})

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { callGemini, testGeminiConnectivity } from '../server/adapters/aiProvider.js';

describe('Gemini API Error Mapping and Diagnosis Suite', () => {

  it('1. Detects unconfigured or placeholder key safely', async () => {
    const result = await testGeminiConnectivity('[SENSITIVE-1]');
    assert.equal(result.ok, false);
    assert.equal(result.code, 'KEY_UNCONFIGURED_OR_PLACEHOLDER');
    assert.ok(result.message.includes('placeholder'));
  });

  it('2. Maps HTTP 400 to API_KEY_INVALID error class', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } })
      });

      const res = await testGeminiConnectivity('AIzaSyDummyKeyTest');
      assert.equal(res.ok, false);
      assert.equal(res.code, 'API_KEY_INVALID');
      assert.equal(res.status, 400);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('3. Maps HTTP 403 to PERMISSION_DENIED error class', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ error: { code: 403, message: 'The caller does not have permission' } })
      });

      const res = await testGeminiConnectivity('AIzaSyDummyKeyTest');
      assert.equal(res.ok, false);
      assert.equal(res.code, 'PERMISSION_DENIED');
      assert.equal(res.status, 403);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('4. Maps HTTP 404 to MODEL_NOT_FOUND error class', async () => {
    const originalFetch = global.fetch;
    try {
      // First list models succeeds, second ping call returns 404
      let callCount = 0;
      global.fetch = async () => {
        callCount++;
        if (callCount === 1) {
          return { ok: true, json: async () => ({ models: [] }) };
        }
        return {
          ok: false,
          status: 404,
          text: async () => JSON.stringify({ error: { code: 404, message: 'models/retired-model is not found' } })
        };
      };

      const res = await testGeminiConnectivity('AIzaSyDummyKeyTest');
      assert.equal(res.ok, false);
      assert.equal(res.code, 'MODEL_NOT_FOUND');
      assert.equal(res.status, 404);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('5. Maps HTTP 429 to RATE_LIMIT_EXCEEDED error class', async () => {
    const originalFetch = global.fetch;
    try {
      global.fetch = async () => ({
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { code: 429, message: 'Resource has been exhausted' } })
      });

      const res = await testGeminiConnectivity('AIzaSyDummyKeyTest');
      assert.equal(res.ok, false);
      assert.equal(res.code, 'RATE_LIMIT_EXCEEDED');
      assert.equal(res.status, 429);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('6. Successfully completes generateContent on healthy response', async () => {
    const originalFetch = global.fetch;
    const originalKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = 'AIzaSyDummyKeyTest';
      global.fetch = async () => ({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: '{"origin":"Delhi","destination":"Patna"}' }] } }]
        })
      });

      const text = await callGemini('parse travel query');
      assert.ok(text.includes('Delhi'));
      assert.ok(text.includes('Patna'));
    } finally {
      global.fetch = originalFetch;
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

});

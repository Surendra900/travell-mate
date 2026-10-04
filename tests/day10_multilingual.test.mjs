import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { languages, phraseTranslations, OFFLINE_UI_TRANSLATIONS } from '../src/data/languageData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const REQUIRED_INDIAN_LANGS = ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur']

test('Day 10: languageData includes all 10 Indian languages with labels and phrases', () => {
  for (const lang of REQUIRED_INDIAN_LANGS) {
    assert.ok(languages[lang], `Language ${lang} should exist in languages map`)
    assert.ok(languages[lang].name, `Language ${lang} must have a native name`)
    assert.ok(languages[lang].labels, `Language ${lang} must have labels`)
    assert.ok(languages[lang].phrases, `Language ${lang} must have phrases`)

    // Verify critical emergency phrases exist in this language
    const phrases = languages[lang].phrases
    assert.ok(phrases.help, `Language ${lang} must have help phrase`)
    assert.ok(phrases.ambulance, `Language ${lang} must have ambulance phrase`)
    assert.ok(phrases.police, `Language ${lang} must have police phrase`)
    assert.ok(phrases.hospital, `Language ${lang} must have hospital phrase`)
  }
})

test('Day 10: Urdu is configured with RTL direction', () => {
  assert.equal(languages.ur.dir, 'rtl', 'Urdu must be designated as RTL')
})

test('Day 10: phraseTranslations contains complete coverage for 10 Indian languages', () => {
  assert.ok(phraseTranslations.length >= 7, 'Should have at least 7 emergency phrase groups')
  for (const phrase of phraseTranslations) {
    assert.ok(phrase.key, 'Phrase group must have key')
    assert.ok(phrase.en, 'Phrase group must have en text')
    for (const lang of REQUIRED_INDIAN_LANGS) {
      assert.ok(phrase[lang], `Phrase ${phrase.key} missing in language ${lang}`)
      assert.notEqual(phrase[lang].trim(), '', `Phrase ${phrase.key} empty in language ${lang}`)
    }
  }
})

test('Day 10: OFFLINE_UI_TRANSLATIONS contains immediate fallback for all 10 Indian languages', () => {
  for (const lang of REQUIRED_INDIAN_LANGS) {
    const dict = OFFLINE_UI_TRANSLATIONS[lang]
    assert.ok(dict, `Offline fallback dict missing for ${lang}`)
    assert.ok(dict['Explore'], `Explore missing in ${lang}`)
    assert.ok(dict['My Trips'], `My Trips missing in ${lang}`)
    assert.ok(dict['Safety'], `Safety missing in ${lang}`)
    assert.ok(dict['Assistant'], `Assistant missing in ${lang}`)
    assert.ok(dict['Emergency Travel Copilot'], `Emergency Travel Copilot missing in ${lang}`)
  }
})

test('Day 10: api/translate.js and GlobalTranslationLayer support Punjabi and offline dictionary', () => {
  const apiTranslate = fs.readFileSync(path.join(root, 'api/translate.js'), 'utf8')
  assert.match(apiTranslate, /pa:\s*['"]Punjabi['"]/, 'api/translate.js must include pa: Punjabi')

  const gtl = fs.readFileSync(path.join(root, 'src/components/GlobalTranslationLayer.jsx'), 'utf8')
  assert.match(gtl, /OFFLINE_UI_TRANSLATIONS/, 'GlobalTranslationLayer must import OFFLINE_UI_TRANSLATIONS')
  assert.match(gtl, /pa:\s*['"]/, 'GlobalTranslationLayer TRANSLATING_TEXT must support Punjabi')
})

test('Day 10: EmergencyPhraseCards component exists with Web Speech and 10 regional languages', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/EmergencyPhraseCards.jsx'), 'utf8')
  assert.match(comp, /speechSynthesis/, 'Must use Web Speech Synthesis')
  assert.match(comp, /clipboard(?:\?\.|\.)writeText/, 'Must support clipboard copy')
  for (const lang of REQUIRED_INDIAN_LANGS) {
    assert.match(comp, new RegExp(`code:\\s*['"]${lang}['"]`), `Language selector must include ${lang}`)
  }
})

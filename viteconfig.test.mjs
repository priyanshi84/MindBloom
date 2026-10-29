import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const configUrl = new URL('./vite.config.ts', import.meta.url);

describe('ViteconfigTests', () => {
  it('vite.config.ts exists', () => {
    assert.strictEqual(fs.existsSync(configUrl), true);
  });

  it('exports a default config built with defineConfig', () => {
    const source = fs.readFileSync(configUrl, 'utf8');
    assert.ok(source.includes('export default defineConfig('));
  });

  it('registers the react plugin', () => {
    const source = fs.readFileSync(configUrl, 'utf8');
    assert.ok(source.includes('react()'));
    assert.ok(source.includes('@vitejs/plugin-react'));
  });

  it('defines the GEMINI_API_KEY environment replacement', () => {
    const source = fs.readFileSync(configUrl, 'utf8');
    assert.ok(source.includes('process.env.GEMINI_API_KEY'));
    assert.ok(source.includes('loadEnv('));
  });

  it('defines the @ path alias', () => {
    const source = fs.readFileSync(configUrl, 'utf8');
    assert.ok(source.includes("'@'"));
    assert.ok(source.includes('path.resolve('));
  });
});

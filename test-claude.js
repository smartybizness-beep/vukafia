require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  try {
    console.log('Testing Claude API...');
    console.log('API Key:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
    
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Vukafia works!" in exactly 3 words.'
      }]
    });
    
    console.log('✅ Claude API working!');
    console.log('Response:', response.content[0].text);
    process.exit(0);
  } catch (err) {
    console.error('❌ Claude API error:', err.message);
    process.exit(1);
  }
}

test();

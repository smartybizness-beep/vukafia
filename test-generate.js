require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  try {
    console.log('Testing business generation...');
    
    const prompt = `Generate 3 real-sounding African businesses for this market:

Region: West Africa
Country: Nigeria
Category: Electronics

Return a JSON array with this structure for each business:
{
  "name": "Business Name",
  "products_services": "What they offer",
  "description": "Short description (30 words max)",
  "phone": "Valid Nigeria phone number format",
  "website": "website.com or null",
  "city": "Major city in Nigeria"
}

Make them sound REAL and VERIFIABLE. Use actual city names. Use realistic phone numbers for Nigeria.
Include well-known companies when relevant. Be specific about what they do.`;

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;
    console.log('Raw response from Claude:');
    console.log(text);
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      console.log('\n✅ JSON found!');
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(JSON.stringify(parsed, null, 2));
    } else {
      console.log('\n❌ No JSON array found in response');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test().then(() => process.exit(0));

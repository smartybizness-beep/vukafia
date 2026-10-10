/**
 * services/whatsappAssistant.js
 * AI-powered WhatsApp Assistant using Claude
 * Intelligently responds to customer inquiries on WhatsApp
 */

'use strict';

const { Anthropic } = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Trima, an AI assistant for Vukafia - Africa's #1 business directory.

ABOUT VUKAFIA:
- Connects African businesses with customers
- Covers 54+ African countries
- Businesses list for FREE
- Customers can search and claim businesses for $14.99 USD
- Primary contact: WhatsApp (no emails)
- Verified businesses get a ✅ badge

YOUR ROLE:
1. Help users register/list their businesses
2. Help users claim/verify their businesses
3. Help users search for businesses
4. Answer questions about Vukafia
5. Be friendly, professional, helpful

KEY FEATURES TO MENTION:
- FREE to list your business (takes 2 minutes)
- Claim for $14.99 to verify ownership
- Reach customers across Africa
- Direct WhatsApp contact (no intermediaries)
- Instant verification (no waiting)

USER INTENTS YOU HANDLE:
1. "register" / "list business" → Guide to registration
2. "claim" / "verify" → Guide to claiming
3. "search" / "find" → Guide to search
4. "payment" / "cost" → Explain pricing
5. "how does it work" → Explain the platform
6. "contact support" → Offer support contact
7. General questions → Answer based on knowledge

RESPONSE GUIDELINES:
- Keep responses SHORT (1-3 sentences max for WhatsApp)
- Use emojis to make it friendly
- Always include next action/link when relevant
- If they want to do something: give them a direct link
- If you don't know: offer to connect with support team
- Always be encouraging and positive

IMPORTANT:
- Users are on WhatsApp, keep it concise
- Offer links: https://vukafia.com/register (register), https://vukafia.com (claim/search)
- If complex: "Reply SUPPORT to chat with our team"
- Use their language style (casual, friendly, African)

TONE: Friendly, helpful, knowledgeable, supportive. Be like a local business friend.`;

/**
 * Process user message with Claude and generate response
 */
async function generateSmartResponse(userMessage, conversationHistory = []) {
  try {
    // Build conversation with history
    const messages = [
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage
      }
    ];

    console.log(`🤖 Processing WhatsApp message: "${userMessage.substring(0, 50)}..."`);

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 300, // Keep responses short for WhatsApp
      system: SYSTEM_PROMPT,
      messages: messages
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Sorry, I had trouble understanding that. Can you rephrase?';

    console.log(`✅ Response generated: "${assistantMessage.substring(0, 50)}..."`);

    return {
      success: true,
      message: assistantMessage,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    };
  } catch (err) {
    console.error('❌ Claude API error:', err.message);

    // Fallback response if Claude fails
    return {
      success: false,
      message: '🤔 Sorry, I had trouble processing that. Try:\n\n1️⃣ Register your business → https://vukafia.com\n2️⃣ Claim your business → Search at https://vukafia.com\n3️⃣ Need help? Reply SUPPORT',
      error: err.message
    };
  }
}

/**
 * Detect user intent and provide smart routing
 */
async function detectIntentAndRespond(userMessage) {
  try {
    const lowerMessage = userMessage.toLowerCase();

    // Quick intent detection (with AI fallback)
    let intent = 'general';

    if (lowerMessage.match(/register|list|add.*business|new.*business|start.*business/)) {
      intent = 'register';
    } else if (lowerMessage.match(/claim|verify|own.*business|my.*business/)) {
      intent = 'claim';
    } else if (lowerMessage.match(/search|find|look.*for|where.*is/)) {
      intent = 'search';
    } else if (lowerMessage.match(/cost|price|fee|how much|payment/)) {
      intent = 'pricing';
    } else if (lowerMessage.match(/how.*work|what|why|about|explain/)) {
      intent = 'info';
    } else if (lowerMessage.match(/support|help|contact|issue|problem|urgent/)) {
      intent = 'support';
    }

    // Log detected intent
    console.log(`📍 Detected intent: ${intent}`);

    // Get AI-generated response
    const aiResponse = await generateSmartResponse(userMessage);

    return {
      success: true,
      intent,
      response: aiResponse.message,
      usage: aiResponse.usage
    };
  } catch (err) {
    console.error('❌ Intent detection error:', err.message);
    return {
      success: false,
      intent: 'error',
      response: '😊 I want to help! What would you like to do?\n\n1️⃣ List your business (FREE)\n2️⃣ Claim your business ($14.99)\n3️⃣ Search for businesses\n4️⃣ Talk to support'
    };
  }
}

/**
 * Format response for WhatsApp (add helpful footer)
 */
function formatForWhatsApp(message, intent = 'general') {
  let formatted = message;

  // Add helpful context based on intent
  if (intent === 'register') {
    formatted += '\n\n👉 Go to: https://vukafia.com (Click "+ List Business")';
  } else if (intent === 'claim') {
    formatted += '\n\n👉 Go to: https://vukafia.com (Search then claim)';
  } else if (intent === 'search') {
    formatted += '\n\n👉 Go to: https://vukafia.com (Use search bar)';
  }

  // Add footer if not already present
  if (!formatted.includes('SUPPORT')) {
    formatted += '\n\n💬 Need help? Reply SUPPORT';
  }

  return formatted;
}

/**
 * Handle conversation with memory (for future multi-turn conversations)
 */
class WhatsAppConversation {
  constructor(userPhone) {
    this.userPhone = userPhone;
    this.history = [];
    this.createdAt = new Date();
    this.lastMessageAt = new Date();
  }

  addMessage(role, content) {
    this.history.push({ role, content });
    this.lastMessageAt = new Date();
  }

  getHistory() {
    return this.history;
  }

  isExpired(minutesThreshold = 30) {
    const timeDiff = (new Date() - this.lastMessageAt) / (1000 * 60);
    return timeDiff > minutesThreshold;
  }
}

// Store conversations in memory (in production, use Redis or database)
const conversations = new Map();

/**
 * Get or create conversation for user
 */
function getConversation(userPhone) {
  if (!conversations.has(userPhone)) {
    conversations.set(userPhone, new WhatsAppConversation(userPhone));
  }

  const conversation = conversations.get(userPhone);

  // Reset if expired
  if (conversation.isExpired()) {
    conversation.history = [];
  }

  return conversation;
}

/**
 * Main handler for incoming WhatsApp messages
 */
async function handleWhatsAppMessage(userPhone, userMessage) {
  try {
    console.log(`\n📱 [WhatsApp] ${userPhone}: ${userMessage}`);

    // Get or create conversation
    const conversation = getConversation(userPhone);

    // Check for support request
    if (userMessage.toLowerCase() === 'support') {
      conversation.history = []; // Clear history
      return {
        success: true,
        message: '📞 Support team contacted!\n\nWhatsApp: +2348101477935\nEmail: info@vukafia.com\n\nWe typically respond within 2-4 hours during business hours (Mon-Fri, 9am-6pm WAT).'
      };
    }

    // Detect intent and get AI response
    const result = await detectIntentAndRespond(userMessage);

    if (result.success) {
      // Add to conversation history
      conversation.addMessage('user', userMessage);
      conversation.addMessage('assistant', result.response);

      // Format for WhatsApp
      const formatted = formatForWhatsApp(result.response, result.intent);

      return {
        success: true,
        message: formatted,
        intent: result.intent,
        usage: result.usage
      };
    } else {
      return {
        success: false,
        message: result.response
      };
    }
  } catch (err) {
    console.error('❌ WhatsApp handler error:', err.message);
    return {
      success: false,
      message: '😊 Something went wrong. Let me connect you with our support team!\n\n💬 WhatsApp: +2348101477935'
    };
  }
}

module.exports = {
  handleWhatsAppMessage,
  generateSmartResponse,
  detectIntentAndRespond,
  formatForWhatsApp,
  getConversation
};

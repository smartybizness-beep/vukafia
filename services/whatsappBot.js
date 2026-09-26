/**
 * services/whatsappBot.js
 * WhatsApp AI Chatbot for business onboarding
 * Uses Twilio for WhatsApp integration
 */

'use strict';

const db = require('../db');
const { initializePayment } = require('./paystack');

// Store conversation state in memory (use Redis in production)
const conversations = new Map();

// Business categories for WhatsApp selection
const CATEGORIES = [
  'Agricultural Products',
  'Minerals & Mining',
  'Manufacturing',
  'Services',
  'Restaurant',
  'Tourism',
  'Medical',
  'Beauty & Personal Care',
  'General Retail'
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'Egypt', 'Morocco', 'South Africa',
  'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda', 'Côte d\'Ivoire', 'Cameroon'
];

// Get or create conversation state
function getConversation(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, {
      phoneNumber,
      step: 'greeting',
      data: {},
      createdAt: Date.now()
    });
  }
  return conversations.get(phoneNumber);
}

// Build category menu
function getCategoryMenu() {
  let menu = 'Select your business category:\n\n';
  CATEGORIES.forEach((cat, idx) => {
    menu += `${idx + 1}. ${cat}\n`;
  });
  return menu;
}

// Build country menu
function getCountryMenu() {
  let menu = 'Select your country:\n\n';
  COUNTRIES.forEach((country, idx) => {
    menu += `${idx + 1}. ${country}\n`;
  });
  return menu;
}

// Main message handler
async function handleWhatsAppMessage(phoneNumber, messageText, mediaUrl = null) {
  const conv = getConversation(phoneNumber);
  const userInput = messageText.trim();
  let response = '';

  try {
    switch (conv.step) {
      case 'greeting':
        response = await handleGreeting(conv, userInput);
        break;
      case 'menu':
        response = await handleMenu(conv, userInput);
        break;
      case 'register_name':
        response = await handleRegisterName(conv, userInput);
        break;
      case 'register_category':
        response = await handleRegisterCategory(conv, userInput);
        break;
      case 'register_country':
        response = await handleRegisterCountry(conv, userInput);
        break;
      case 'register_city':
        response = await handleRegisterCity(conv, userInput);
        break;
      case 'register_phone':
        response = await handleRegisterPhone(conv, userInput);
        break;
      case 'register_website':
        response = await handleRegisterWebsite(conv, userInput);
        break;
      case 'register_photo':
        response = await handleRegisterPhoto(conv, mediaUrl);
        break;
      case 'register_payment':
        response = await handleRegisterPayment(conv);
        break;
      case 'search_category':
        response = await handleSearchCategory(conv, userInput);
        break;
      default:
        response = 'Sorry, I didn\'t understand. Please try again.';
    }
  } catch (err) {
    console.error('WhatsApp bot error:', err);
    response = '❌ Sorry, something went wrong. Please try again later.';
  }

  return response;
}

async function handleGreeting(conv, input) {
  conv.step = 'menu';
  return `👋 Welcome to VukaFia! My name is Tumi and I'll be your bot assistant.

What would you like to do?

1️⃣  Register a new business
2️⃣  Claim an existing business
3️⃣  Search for businesses

Please reply with 1, 2, or 3`;
}

async function handleMenu(conv, input) {
  const choice = input.toLowerCase().trim();

  if (choice === '1') {
    conv.step = 'register_name';
    return '✨ Great! Let\'s register your business.\n\nWhat is your business name?';
  } else if (choice === '2') {
    return '📝 To claim a business, visit: https://vukafia.com and use the "Claim Business" button.\n\nNeed help? Reply with any message to continue.';
  } else if (choice === '3') {
    return '🔍 Visit https://vukafia.com to search for businesses.\n\nWant to register instead? Reply with "1"';
  } else {
    return '❌ Please reply with 1, 2, or 3';
  }
}

async function handleRegisterName(conv, input) {
  if (!input || input.length < 2) {
    return '⚠️  Please enter a valid business name (at least 2 characters)';
  }
  conv.data.name = input;
  conv.step = 'register_category';
  return getCategoryMenu();
}

async function handleRegisterCategory(conv, input) {
  const categoryIdx = parseInt(input) - 1;
  if (categoryIdx < 0 || categoryIdx >= CATEGORIES.length) {
    return '❌ Please select a valid category number';
  }
  conv.data.category = CATEGORIES[categoryIdx];
  conv.step = 'register_country';
  return getCountryMenu();
}

async function handleRegisterCountry(conv, input) {
  const countryIdx = parseInt(input) - 1;
  if (countryIdx < 0 || countryIdx >= COUNTRIES.length) {
    return '❌ Please select a valid country number';
  }
  conv.data.country = COUNTRIES[countryIdx];
  conv.step = 'register_city';
  return 'What city is your business in?';
}

async function handleRegisterCity(conv, input) {
  if (!input || input.length < 2) {
    return '⚠️  Please enter a valid city name';
  }
  conv.data.city = input;
  conv.step = 'register_phone';
  return 'What is your phone number? (including country code, e.g., +234...)';
}

async function handleRegisterPhone(conv, input) {
  const phoneRegex = /^\+\d{1,15}$/;
  if (!phoneRegex.test(input)) {
    return '⚠️  Please enter a valid phone number with country code (e.g., +234...)';
  }
  conv.data.phone = input;
  conv.step = 'register_website';
  return 'Do you have a website? (reply with URL or "No" if you don\'t)';
}

async function handleRegisterWebsite(conv, input) {
  if (input.toLowerCase() === 'no') {
    conv.data.website = null;
  } else {
    conv.data.website = input;
  }
  conv.step = 'register_photo';
  return '📸 Please upload a photo of your business to use as the cover image.';
}

async function handleRegisterPhoto(conv, mediaUrl) {
  if (!mediaUrl) {
    return '⚠️  Please upload a photo. Reply with an image.';
  }
  conv.data.cover_photo = mediaUrl;
  conv.step = 'register_payment';
  return `✅ Great! Here's what we have:

📦 Business Name: ${conv.data.name}
🏷️  Category: ${conv.data.category}
🌍 Location: ${conv.data.city}, ${conv.data.country}
📞 Phone: ${conv.data.phone}
🌐 Website: ${conv.data.website || 'Not provided'}

Ready to complete registration?

💰 Registration fee: $15 (free to register, $15 to go live)
⭐ Featured listing: $20

Reply "yes" to proceed with payment`;
}

async function handleRegisterPayment(conv) {
  // Create Paystack payment link for registration
  const paymentUrl = `https://paystack.com/pay/register-business`; // Would be actual Paystack link

  return `💳 Please complete payment to finalize your registration:\n\n${paymentUrl}\n\nAfter payment, your business will be live on VukaFia with "💬 WhatsApp AI Verified" badge!`;
}

async function handleSearchCategory(conv, input) {
  return '🔍 Visit https://vukafia.com to search by category, country, and more.';
}

// Clean up old conversations (older than 24 hours)
function cleanupConversations() {
  const now = Date.now();
  for (const [phone, conv] of conversations.entries()) {
    if (now - conv.createdAt > 24 * 60 * 60 * 1000) {
      conversations.delete(phone);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupConversations, 60 * 60 * 1000);

module.exports = {
  handleWhatsAppMessage,
  getConversation
};

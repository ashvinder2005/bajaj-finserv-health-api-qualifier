// ===============================
// BFHL QUALIFIER - FINAL SERVER FILE
// ===============================

require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const OFFICIAL_EMAIL = "ashvinder1133.be23@chitkarauniversity.edu.in";

// ===============================
// HEALTH API
// ===============================
app.get('/health', (req, res) => {
  return res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

// ===============================
// UTILITY FUNCTIONS
// ===============================
const isPrime = (num) => {
  if (!Number.isInteger(num) || num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
const lcm = (a, b) => (a * b) / gcd(a, b);

// ===============================
// MAIN POST API
// ===============================
app.post('/bfhl', async (req, res) => {
  try {
    const body = req.body;

    // Validate single key only
    if (!body || Object.keys(body).length !== 1) {
      return res.status(400).json({
        is_success: false,
        official_email: OFFICIAL_EMAIL,
        error: "Request must contain exactly one valid key"
      });
    }

    const key = Object.keys(body)[0];
    const value = body[key];

    let data;

    switch (key) {

      case 'fibonacci':
        if (typeof value !== 'number' || value < 0) {
          throw new Error('Invalid fibonacci input');
        }
        data = [];
        let a = 0, b = 1;
        for (let i = 0; i < value; i++) {
          data.push(a);
          [a, b] = [b, a + b];
        }
        break;

      case 'prime':
        if (!Array.isArray(value)) {
          throw new Error('Prime input must be array');
        }
        data = value.filter(num => isPrime(num));
        break;

      case 'lcm':
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('LCM input must be non-empty array');
        }
        data = value.reduce((acc, curr) => lcm(acc, curr));
        break;

      case 'hcf':
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('HCF input must be non-empty array');
        }
        data = value.reduce((acc, curr) => gcd(acc, curr));
        break;

      case 'AI':
        if (typeof value !== 'string' || value.trim() === '') {
          throw new Error('AI input must be valid string');
        }

        if (!process.env.GEMINI_API_KEY) {
          throw new Error('API key not configured');
        }

        const fetch = (await import('node-fetch')).default;

        const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="+ process.env.GEMINI_API_KEY,

          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: "Answer in one word only: " + value }
                  ]
                }
              ]
            })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error?.message || 'AI API request failed');
        }

        if (!result.candidates || !result.candidates[0]) {
          throw new Error('Invalid AI response format');
        }

        data = result.candidates[0].content.parts[0].text
          .trim()
          .split(/\s+/)[0];

        break;

      default:
        throw new Error('Invalid key provided');
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    return res.status(422).json({
      is_success: false,
      official_email: OFFICIAL_EMAIL,
      error: err.message
    });
  }
});

// ===============================
// START SERVER
// ===============================

console.log("Loaded Key:", process.env.GEMINI_API_KEY);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const express = require('express');
const app = express();

app.use(express.json());

// ── Home ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app: 'NutriHelp API',
    version: '1.0.0',
    description: 'AI-powered nutrition app for elderly Australians',
    status: 'running'
  });
});

// ── Health Check (used by Jenkins monitoring) ─
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ── Nutrition Endpoint ────────────────────────
app.get('/api/nutrition', (req, res) => {
  res.json({
    calories: 2000,
    protein: '50g',
    carbs: '250g',
    fat: '65g',
    fibre: '30g',
    message: 'Daily nutrition targets for senior user'
  });
});

// ── Meal Plan Endpoint ────────────────────────
app.get('/api/meal-plan', (req, res) => {
  res.json({
    day: 'Monday',
    meals: [
      { time: 'Breakfast', food: 'Oats with banana', calories: 350 },
      { time: 'Lunch',     food: 'Grilled chicken salad', calories: 450 },
      { time: 'Dinner',    food: 'Salmon with vegetables', calories: 600 }
    ],
    totalCalories: 1400
  });
});

// ── Recipe Endpoint ───────────────────────────
app.get('/api/recipes', (req, res) => {
  res.json({
    recipes: [
      { id: 1, name: 'Avocado Toast',     calories: 250, allergens: ['gluten'] },
      { id: 2, name: 'Greek Yogurt Bowl', calories: 180, allergens: ['dairy']  },
      { id: 3, name: 'Banana Smoothie',   calories: 200, allergens: []         }
    ]
  });
});

// ── Metrics (for monitoring stage) ───────────
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(
    `# HELP nutrihelp_uptime_seconds App uptime in seconds\n` +
    `# TYPE nutrihelp_uptime_seconds gauge\n` +
    `nutrihelp_uptime_seconds ${process.uptime()}\n` +
    `# HELP nutrihelp_requests_total Total requests served\n` +
    `# TYPE nutrihelp_requests_total counter\n` +
    `nutrihelp_requests_total 42\n`
  );
});

module.exports = app;
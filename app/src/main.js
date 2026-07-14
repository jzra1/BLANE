import './style.css';
import philfctData from './data/philfct.json';

// Default User Profile State (Mutable)
let USER_PROFILE = {
  gender: 'male',
  age: 22,
  height: 170, // cm
  activityFactor: 1.375, // Lightly active
  dietaryRestrictions: []
};

// Map initialization state
let map = null;
let markers = [];

// DOM Elements
const tabRecommendationsBtn = document.getElementById('tab-recommendations');
const tabMarketsBtn = document.getElementById('tab-markets');
const tabRecipesBtn = document.getElementById('tab-recipes');
const tabAdminBtn = document.getElementById('tab-admin');

const contentRecommendations = document.getElementById('content-recommendations');
const contentMarkets = document.getElementById('content-markets');
const contentRecipes = document.getElementById('content-recipes');
const contentAdmin = document.getElementById('content-admin');

const metricsForm = document.getElementById('metrics-form');
const inputWeight = document.getElementById('input-weight');
const inputActiveCal = document.getElementById('input-active-cal');
const inputSleep = document.getElementById('input-sleep');
const inputWater = document.getElementById('input-water');

const valBmi = document.getElementById('val-bmi');
const valTdee = document.getElementById('val-tdee');
const valDailyTarget = document.getElementById('val-daily-target');
const valHealthScore = document.getElementById('val-health-score');
const selectPortionScale = document.getElementById('select-portion-scale');
const valPortionMultipliers = document.querySelectorAll('.val-portion-multiplier');
const valSpend = document.getElementById('val-spend');
const aiRationale = document.getElementById('ai-rationale');
const lblActiveMarket = document.getElementById('lbl-active-market');
const inputBudget = document.getElementById('input-budget');

// Market state variables
let currentMarket = 'public';
const marketMultipliers = { public: 1.0, sm: 1.2 };
const MEAL_REC_POOL = {
  breakfast: [
    {
      name: "Garlic Fried Rice & Boiled Egg",
      desc: "Classic Pinoy breakfast, low cost, energy-dense.",
      calories: 380,
      basePrice: 55,
      diets: ["halal"],
      allergens: ["egg"]
    },
    {
      name: "Oatmeal with Sliced Bananas",
      desc: "High-fiber breakfast, cholesterol-free, diabetic-friendly.",
      calories: 300,
      basePrice: 45,
      diets: ["vegetarian", "halal", "diabetic", "hypertension"],
      allergens: []
    },
    {
      name: "Taho (Warm Tofu with Arnibal & Sago)",
      desc: "Classic street food, rich plant protein and sweet syrup.",
      calories: 250,
      basePrice: 30,
      diets: ["vegetarian", "halal"],
      allergens: []
    }
  ],
  lunch: [
    {
      name: "Ginisang Monggo with Tinapa",
      desc: "High in protein and iron, matches FNRI standards.",
      calories: 550,
      basePrice: 110,
      diets: ["halal"],
      allergens: ["seafood"]
    },
    {
      name: "Chopsuey (Stir-fried Vegetables & Tofu)",
      desc: "Rich in fiber and vitamins, vegetarian and heart-healthy.",
      calories: 320,
      basePrice: 90,
      diets: ["vegetarian", "halal", "diabetic", "hypertension"],
      allergens: []
    },
    {
      name: "Sinigang na Salmon Belly",
      desc: "Sour tamarind broth rich in Omega-3 fatty acids.",
      calories: 450,
      basePrice: 150,
      diets: ["halal", "diabetic", "hypertension"],
      allergens: ["seafood"]
    }
  ],
  dinner: [
    {
      name: "Chicken Tinola (Breast)",
      desc: "In-season ginger soup, low fat, high clean protein.",
      calories: 480,
      basePrice: 80,
      diets: ["halal", "diabetic"],
      allergens: []
    },
    {
      name: "Adobong Sitaw (String Beans & Tofu)",
      desc: "Savory soy sauce simmered string beans and tofu cubes.",
      calories: 310,
      basePrice: 70,
      diets: ["vegetarian", "halal", "diabetic", "hypertension"],
      allergens: []
    },
    {
      name: "Pinakbet (Local Squash & Okra)",
      desc: "Fiber-rich native vegetables, low sodium version.",
      calories: 280,
      basePrice: 65,
      diets: ["vegetarian", "halal", "diabetic", "hypertension"],
      allergens: []
    }
  ]
};

function getBestRecommendedMeal(mealType) {
  const pool = MEAL_REC_POOL[mealType];
  const activeRestrictions = USER_PROFILE.dietaryRestrictions || [];
  
  // 1. Exclude dishes with active allergen/diet restrictions
  let candidates = pool.filter(dish => {
    for (const restriction of activeRestrictions) {
      if (restriction === 'peanut-free' && dish.allergens.includes('peanut')) return false;
      if (restriction === 'seafood-free' && dish.allergens.includes('seafood')) return false;
      if (restriction === 'dairy-free' && dish.allergens.includes('dairy')) return false;
      if (restriction === 'egg-free' && dish.allergens.includes('egg')) return false;
    }
    
    // Strict diets
    if (activeRestrictions.includes('vegetarian') && !dish.diets.includes('vegetarian')) return false;
    if (activeRestrictions.includes('halal') && !dish.diets.includes('halal')) return false;
    
    return true;
  });
  
  if (candidates.length === 0) {
    // Fallback if everything filtered out
    return pool[pool.length - 1];
  }
  
  // 2. Score candidates based on diabetic/hypertension indicators
  let bestMeal = candidates[0];
  let maxScore = -1;
  candidates.forEach(dish => {
    let score = 0;
    if (activeRestrictions.includes('diabetic') && dish.diets.includes('diabetic')) score += 2;
    if (activeRestrictions.includes('hypertension') && dish.diets.includes('hypertension')) score += 2;
    if (score > maxScore) {
      maxScore = score;
      bestMeal = dish;
    }
  });
  
  return bestMeal;
}

// Tab Navigation logic
function switchTab(activeTab) {
  // Reset tabs
  [tabRecommendationsBtn, tabMarketsBtn, tabRecipesBtn, tabAdminBtn].forEach(btn => btn.classList.remove('active'));
  [contentRecommendations, contentMarkets, contentRecipes, contentAdmin].forEach(content => content.style.display = 'none');

  if (activeTab === 'recommendations') {
    tabRecommendationsBtn.classList.add('active');
    contentRecommendations.style.display = 'block';
  } else if (activeTab === 'markets') {
    tabMarketsBtn.classList.add('active');
    contentMarkets.style.display = 'block';
    // Initialize map if not yet done
    initMap();
  } else if (activeTab === 'recipes') {
    tabRecipesBtn.classList.add('active');
    contentRecipes.style.display = 'block';
  } else if (activeTab === 'admin') {
    tabAdminBtn.classList.add('active');
    contentAdmin.style.display = 'block';
  }
}

tabRecommendationsBtn.addEventListener('click', () => switchTab('recommendations'));
tabMarketsBtn.addEventListener('click', () => switchTab('markets'));
tabRecipesBtn.addEventListener('click', () => switchTab('recipes'));
tabAdminBtn.addEventListener('click', () => switchTab('admin'));

// Formula Calculations (Mifflin-St Jeor)
function calculateTargets() {
  const weight = parseFloat(inputWeight.value) || 70;
  const activeCalories = parseFloat(inputActiveCal.value) || 0;
  const sleep = parseFloat(inputSleep.value) || 7;
  const water = parseFloat(inputWater.value) || 2000;

  // 1. BMI Calculation
  const heightMeters = USER_PROFILE.height / 100;
  const bmi = weight / (heightMeters * heightMeters);
  let bmiCategory = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  valBmi.textContent = `${bmi.toFixed(1)} (${bmiCategory})`;

  // 2. Mifflin-St Jeor BMR
  let bmr = 0;
  if (USER_PROFILE.gender === 'male') {
    bmr = 10 * weight + 6.25 * USER_PROFILE.height - 5 * USER_PROFILE.age + 5;
  } else {
    bmr = 10 * weight + 6.25 * USER_PROFILE.height - 5 * USER_PROFILE.age - 161;
  }

  // TDEE = BMR * Activity Factor + Active Calories (logged from Health Connect)
  const tdee = Math.round(bmr * USER_PROFILE.activityFactor + activeCalories);
  valTdee.textContent = `${tdee.toLocaleString()} kcal`;

  // Daily target based on goals
  const targetMultiplier = parseFloat(selectPortionScale.value);
  const dailyTarget = Math.round(tdee * targetMultiplier);
  valDailyTarget.textContent = `${dailyTarget.toLocaleString()} kcal`;

  // 3. Health Score Model (Toy representation of Health Drift)
  // Penalize low sleep, low water, and off-target BMI
  let score = 100;
  if (sleep < 7) score -= (7 - sleep) * 10;
  if (water < 2000) score -= ((2000 - water) / 250) * 5;
  if (bmiCategory !== 'Normal') score -= 15;
  score = Math.max(0, Math.min(100, Math.round(score)));
  valHealthScore.textContent = score;

  // Update Rationale Explanation dynamically
  aiRationale.textContent = `Analyzing your BMI (${bmi.toFixed(1)} - ${bmiCategory}), active calories (${activeCalories} kcal), and remaining daily target. Recommending local, high-protein Filipino dishes. Portions scaled to ${targetMultiplier}x to target exactly ${dailyTarget.toLocaleString()} kcal.`;

  // Update Portion UI label
  valPortionMultipliers.forEach(el => {
    el.textContent = `${targetMultiplier}x`;
  });

  // Est. spend and dynamic meal rendering based on portion scale, dietary restrictions, and dynamic market multiplier
  const marketMult = marketMultipliers[currentMarket];
  
  const breakfast = getBestRecommendedMeal('breakfast');
  const lunch = getBestRecommendedMeal('lunch');
  const dinner = getBestRecommendedMeal('dinner');
  
  const breakfastPrice = breakfast.basePrice * marketMult * targetMultiplier;
  const lunchPrice = lunch.basePrice * marketMult * targetMultiplier;
  const dinnerPrice = dinner.basePrice * marketMult * targetMultiplier;
  
  const totalSpend = breakfastPrice + lunchPrice + dinnerPrice;
  valSpend.textContent = `₱${totalSpend.toFixed(2)}`;

  // Dynamic budget check to avoid miscalculation and visual overruns
  const dailyBudget = parseFloat(inputBudget.value) || 300;
  if (totalSpend > dailyBudget) {
    valSpend.style.color = 'var(--color-accent)'; // warning color (red/orange)
    aiRationale.textContent += ` ⚠️ Warning: Your estimated daily spend (₱${totalSpend.toFixed(2)}) exceeds your daily food budget limit (₱${dailyBudget.toFixed(2)}).`;
  } else {
    valSpend.style.color = 'var(--color-primary)'; // default primary color (green)
  }
  
  const mealsGrid = document.getElementById('recommended-meals-grid');
  if (mealsGrid) {
    mealsGrid.innerHTML = `
      <!-- Breakfast -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
          <span style="font-size: 12px; font-weight: bold; background: var(--color-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--color-primary);">BREAKFAST</span>
          <span style="font-weight: bold; color: var(--color-accent);">₱${breakfastPrice.toFixed(2)}</span>
        </div>
        <h3>${breakfast.name}</h3>
        <p style="font-size: 14px; opacity: 0.8; margin-top: var(--space-xs);">${breakfast.desc}</p>
        <div style="margin-top: var(--space-md); display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
          <span>Cal: <strong>${Math.round(breakfast.calories * targetMultiplier)} kcal</strong></span>
          <span>Portion: <strong>${targetMultiplier}x</strong></span>
        </div>
      </div>

      <!-- Lunch -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
          <span style="font-size: 12px; font-weight: bold; background: var(--color-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--color-primary);">LUNCH</span>
          <span style="font-weight: bold; color: var(--color-accent);">₱${lunchPrice.toFixed(2)}</span>
        </div>
        <h3>${lunch.name}</h3>
        <p style="font-size: 14px; opacity: 0.8; margin-top: var(--space-xs);">${lunch.desc}</p>
        <div style="margin-top: var(--space-md); display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
          <span>Cal: <strong>${Math.round(lunch.calories * targetMultiplier)} kcal</strong></span>
          <span>Portion: <strong>${targetMultiplier}x</strong></span>
        </div>
      </div>

      <!-- Dinner -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
          <span style="font-size: 12px; font-weight: bold; background: var(--color-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--color-primary);">DINNER</span>
          <span style="font-weight: bold; color: var(--color-accent);">₱${dinnerPrice.toFixed(2)}</span>
        </div>
        <h3>${dinner.name}</h3>
        <p style="font-size: 14px; opacity: 0.8; margin-top: var(--space-xs);">${dinner.desc}</p>
        <div style="margin-top: var(--space-md); display: flex; justify-content: space-between; font-size: 13px; border-top: 1px solid var(--color-border); padding-top: var(--space-sm);">
          <span>Cal: <strong>${Math.round(dinner.calories * targetMultiplier)} kcal</strong></span>
          <span>Portion: <strong>${targetMultiplier}x</strong></span>
        </div>
      </div>
    `;
  }
}

// Map Initialization (Leaflet.js)
function initMap() {
  if (map) {
    // Force redraw / resize handling
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return;
  }

  // Default Tarlac City Coordinates
  let coords = [15.4833, 120.5833];

  // Create map
  map = L.map('map-container').setView(coords, 14);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add marker for User Location (red marker, draggable)
  const userIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userMarker = L.marker(coords, { icon: userIcon })
    .addTo(map)
    .bindPopup('<b>Your Location</b><br>Tarlac City')
    .openPopup();

  // Request browser position using a fallback chain (GPS first, Network secondary)
  if (navigator.geolocation) {
    const onLocationSuccess = (position) => {
      const liveCoords = [position.coords.latitude, position.coords.longitude];
      map.setView(liveCoords, 14);
      userMarker.setLatLng(liveCoords);
      userMarker.bindPopup('<b>Your Live Location</b><br>Acquired successfully via GPS/Network.').openPopup();
    };

    const onLocationError = (error) => {
      console.warn('High accuracy GPS positioning timed out or failed. Retrying with standard network-based accuracy...', error);
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        (err) => {
          console.error('Network geolocation fallback also failed.', err);
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    };

    // Initialize high-accuracy GPS probe with short timeout to prevent lockouts
    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      { enableHighAccuracy: true, timeout: 4000 }
    );
  }

  // Add local markets
  const market1 = L.marker([15.4851, 120.5902])
    .addTo(map)
    .bindPopup('<b>Tarlac City Public Market</b><br>F. Tañedo St.<br>🟢 100% ingredients in stock');

  const market2 = L.marker([15.4815, 120.5960])
    .addTo(map)
    .bindPopup('<b>SM City Tarlac Supermarket</b><br>McArthur Highway<br>🟡 85% ingredients in stock');

  markers.push(market1, market2);
}

// Recipe library rendering
const recipeSearchInput = document.getElementById('recipe-search');
const recipeResultsGrid = document.getElementById('recipe-results-grid');

function renderRecipes(filterText = '') {
  recipeResultsGrid.innerHTML = '';
  const filtered = philfctData.filter(food => 
    food.name.toLowerCase().includes(filterText.toLowerCase()) ||
    food.code.toLowerCase().includes(filterText.toLowerCase())
  );

  if (filtered.length === 0) {
    recipeResultsGrid.innerHTML = '<div class="card" style="grid-column: 1/-1; text-align: center;"><p>No food matches found.</p></div>';
    return;
  }

  filtered.forEach(food => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';
    card.style.padding = 'var(--space-md)';
    card.style.cursor = 'default'; // static item
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-xs);">
        <span style="font-size: 11px; font-weight: bold; background: var(--color-muted); padding: 2px 6px; border-radius: var(--radius-sm); color: var(--color-primary);">${food.code}</span>
        <span style="font-size: 12px; font-weight: bold; color: var(--color-accent);">${food.energy_kcal} kcal</span>
      </div>
      <h3 style="font-size: 15px; margin-bottom: var(--space-sm); min-height: 40px; text-transform: none; font-weight: 500; font-family: var(--font-body);">${food.name}</h3>
      <div style="font-size: 12px; border-top: 1px solid var(--color-border); padding-top: var(--space-xs); display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
        <span>Protein: <strong>${food.protein_g}g</strong></span>
        <span>Fat: <strong>${food.fat_g}g</strong></span>
        <span>Carbs: <strong>${food.carbs_g}g</strong></span>
        <span>Sodium: <strong>${food.sodium_mg}mg</strong></span>
      </div>
    `;
    recipeResultsGrid.appendChild(card);
  });
}

// Dashboard Authentication Navigation
const authContainer = document.getElementById('auth-container');
const dashboardApp = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const loginCard = document.getElementById('login-card');
const signupCard = document.getElementById('signup-card');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const btnLogout = document.getElementById('btn-login');

// Landing / Hero Page Selectors
const landingContainer = document.getElementById('landing-container');
const btnLandingEnter = document.getElementById('btn-landing-enter');
const btnHeroStart = document.getElementById('btn-hero-start');
const loginBackHome = document.getElementById('login-back-home');
const signupBackHome = document.getElementById('signup-back-home');

// Wizard Steps DOM Elements
const wizardForm = document.getElementById('signup-wizard-form');
const wizardSteps = document.querySelectorAll('.wizard-step');
const stepDots = document.querySelectorAll('.step-dot');
const btnWizardPrev = document.getElementById('btn-wizard-prev');
const btnWizardNext = document.getElementById('btn-wizard-next');
const btnWizardSubmit = document.getElementById('btn-wizard-submit');
let currentWizardStep = 1;

// Onboarding Wizard Navigation Flow
function updateWizardUI() {
  wizardSteps.forEach(step => step.classList.remove('active'));
  document.querySelector(`.wizard-step[data-step="${currentWizardStep}"]`).classList.add('active');

  // Update Dots
  stepDots.forEach(dot => {
    const stepNum = parseInt(dot.getAttribute('data-step'));
    dot.className = 'step-dot';
    if (stepNum === currentWizardStep) {
      dot.classList.add('active');
    } else if (stepNum < currentWizardStep) {
      dot.classList.add('completed');
    }
  });

  // Buttons Visibility
  if (currentWizardStep === 1) {
    btnWizardPrev.style.display = 'none';
    btnWizardNext.style.display = 'block';
    btnWizardSubmit.style.display = 'none';
  } else if (currentWizardStep === 4) {
    btnWizardPrev.style.display = 'block';
    btnWizardNext.style.display = 'none';
    btnWizardSubmit.style.display = 'block';
  } else {
    btnWizardPrev.style.display = 'block';
    btnWizardNext.style.display = 'block';
    btnWizardSubmit.style.display = 'none';
  }
}

// Checkbox helper for Styling Checked preferences
document.querySelectorAll('.preference-item').forEach(item => {
  const checkbox = item.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      item.classList.add('checked');
    } else {
      item.classList.remove('checked');
    }
  });
});

// Navigation Click Handlers
switchToSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.style.display = 'none';
  signupCard.style.display = 'block';
  currentWizardStep = 1;
  updateWizardUI();
});

switchToLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupCard.style.display = 'none';
  loginCard.style.display = 'block';
});

btnWizardNext.addEventListener('click', () => {
  // Validate current step before advancing
  const activeFields = document.querySelectorAll(`.wizard-step[data-step="${currentWizardStep}"] input[required], .wizard-step[data-step="${currentWizardStep}"] select[required]`);
  let isValid = true;
  activeFields.forEach(field => {
    if (!field.value) {
      field.reportValidity();
      isValid = false;
    }
  });

  if (isValid && currentWizardStep < 4) {
    currentWizardStep++;
    updateWizardUI();
  }
});

btnWizardPrev.addEventListener('click', () => {
  if (currentWizardStep > 1) {
    currentWizardStep--;
    updateWizardUI();
  }
});

// Auth entry to Dashboard
function enterDashboard() {
  landingContainer.style.display = 'none';
  authContainer.style.display = 'none';
  dashboardApp.style.display = 'block';
  btnLandingEnter.textContent = "Go to Dashboard";
  calculateTargets();
  renderRecipes();
  // Trigger map invalidate size since Leaflet maps need sizing refresh once visible
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 100);
}

// Logins & Submissions
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailVal = document.getElementById('login-email').value || '';
  const passwordVal = document.getElementById('login-password').value || '';
  
  // Find registered user credentials in localStorage
  const users = JSON.parse(localStorage.getItem('blane_users') || '[]');
  const user = users.find(u => u.email === emailVal && u.password === passwordVal);
  
  if (user) {
    // Load registered parameters into memory state
    USER_PROFILE = user.profile;
    
    // Synchronize UI Inputs with loaded parameters
    inputWeight.value = USER_PROFILE.weight || 70;
    document.getElementById('input-budget').value = USER_PROFILE.budget || 300;
    
    // Set portion scale select
    if (USER_PROFILE.dietaryRestrictions && (USER_PROFILE.dietaryRestrictions.includes('diabetic') || USER_PROFILE.dietaryRestrictions.includes('hypertension'))) {
      selectPortionScale.value = "0.8";
    } else {
      selectPortionScale.value = "1.0";
    }
    
    // Update Greeting & Set Active Session
    document.getElementById('lbl-user-name').textContent = user.name;
    localStorage.setItem('blane_current_user', emailVal);
    enterDashboard();
  } else {
    alert('Invalid credentials or account does not exist. Please check your inputs or Sign Up.');
  }
});

wizardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Gather Credentials
  const signupName = document.getElementById('signup-name').value;
  const signupEmail = document.getElementById('signup-email').value;
  const signupPassword = document.getElementById('signup-password').value;
  
  // Capture onboarding profile parameters
  USER_PROFILE.gender = document.getElementById('signup-gender').value;
  USER_PROFILE.age = parseInt(document.getElementById('signup-age').value) || 22;
  USER_PROFILE.height = parseFloat(document.getElementById('signup-height').value) || 170;
  USER_PROFILE.activityFactor = parseFloat(document.getElementById('signup-activity').value) || 1.375;
  
  // Get checked preferences
  const checkedPreferences = [];
  document.querySelectorAll('input[name="preferences"]:checked').forEach(cb => {
    checkedPreferences.push(cb.value);
  });
  USER_PROFILE.dietaryRestrictions = checkedPreferences;

  // Set weights & budgets
  USER_PROFILE.weight = parseFloat(document.getElementById('signup-weight').value) || 70;
  USER_PROFILE.budget = parseFloat(document.getElementById('signup-budget').value) || 300;

  // Sync parameters back to Dashboard Input Forms
  inputWeight.value = USER_PROFILE.weight;
  document.getElementById('input-budget').value = USER_PROFILE.budget;
  
  // Save credentials and profile globally in localStorage
  let users = JSON.parse(localStorage.getItem('blane_users') || '[]');
  users = users.filter(u => u.email !== signupEmail);
  users.push({
    name: signupName,
    email: signupEmail,
    password: signupPassword,
    profile: { ...USER_PROFILE }
  });
  localStorage.setItem('blane_users', JSON.stringify(users));
  localStorage.setItem('blane_current_user', signupEmail);
  
  // Set username greeting in Header
  const userProfileGreeting = document.getElementById('lbl-user-name');
  if (userProfileGreeting && signupName) {
    userProfileGreeting.textContent = signupName;
  }

  // Update Dynamic Portion scale selector based on diet/preferences
  if (checkedPreferences.includes('diabetic') || checkedPreferences.includes('hypertension')) {
    selectPortionScale.value = "0.8"; // Default restriction to light portioning
  } else {
    selectPortionScale.value = "1.0";
  }

  enterDashboard();
});

btnLogout.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('blane_current_user');
  dashboardApp.style.display = 'none';
  authContainer.style.display = 'none';
  landingContainer.style.display = 'flex';
  btnLandingEnter.textContent = "Launch App";
  loginForm.reset();
  wizardForm.reset();
  document.querySelectorAll('.preference-item').forEach(item => item.classList.remove('checked'));
});

// Landing / Hero Navigation Click Handlers
function showAuthScreen(mode) {
  landingContainer.style.display = 'none';
  authContainer.style.display = 'flex';
  if (mode === 'login') {
    loginCard.style.display = 'block';
    signupCard.style.display = 'none';
  } else {
    loginCard.style.display = 'none';
    signupCard.style.display = 'block';
  }
}

function showLandingScreen() {
  authContainer.style.display = 'none';
  dashboardApp.style.display = 'none';
  landingContainer.style.display = 'flex';
  if (localStorage.getItem('blane_current_user')) {
    btnLandingEnter.textContent = "Go to Dashboard";
  } else {
    btnLandingEnter.textContent = "Launch App";
  }
}

btnLandingEnter.addEventListener('click', () => {
  if (localStorage.getItem('blane_current_user')) {
    enterDashboard();
  } else {
    showAuthScreen('login');
  }
});
btnHeroStart.addEventListener('click', () => {
  if (localStorage.getItem('blane_current_user')) {
    enterDashboard();
  } else {
    showAuthScreen('signup');
  }
});
loginBackHome.addEventListener('click', (e) => { e.preventDefault(); showLandingScreen(); });
signupBackHome.addEventListener('click', (e) => { e.preventDefault(); showLandingScreen(); });

// Dashboard Logo Home click handler
const logoHomeBtn = document.getElementById('logo-home-btn');
if (logoHomeBtn) {
  logoHomeBtn.addEventListener('click', () => {
    showLandingScreen();
  });
}

// Event Listeners for Dashboard Changes
metricsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  calculateTargets();
});

selectPortionScale.addEventListener('change', () => {
  calculateTargets();
});

inputBudget.addEventListener('input', () => {
  calculateTargets();
});

recipeSearchInput.addEventListener('input', (e) => {
  renderRecipes(e.target.value);
});

// Market Selection Listener
document.querySelectorAll('.btn-set-market').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const market = button.getAttribute('data-market');
    currentMarket = market;
    
    // Highlight selected card
    document.querySelectorAll('.market-item').forEach(card => {
      card.style.border = '1px solid var(--color-border)';
      card.style.backgroundColor = 'var(--color-card-bg)';
    });
    const activeCard = document.getElementById(`market-${market}-card`);
    if (activeCard) {
      activeCard.style.border = '2px solid var(--color-primary)';
      activeCard.style.backgroundColor = 'var(--color-muted)';
    }

    // Toggle activate button styling
    document.querySelectorAll('.btn-set-market').forEach(btn => {
      btn.className = 'btn btn-secondary btn-set-market';
    });
    button.className = 'btn btn-primary btn-set-market';

    // Update labels and prices
    const marketName = market === 'public' ? 'Public Market' : 'SM Supermarket';
    lblActiveMarket.textContent = `Active Market: ${marketName} (${marketMultipliers[market].toFixed(2)}x)`;
    calculateTargets();
  });
});

// Admin markup form
const adminPricingForm = document.getElementById('admin-pricing-form');
const adminPublicMult = document.getElementById('admin-public-mult');
const adminSmMult = document.getElementById('admin-sm-mult');

adminPricingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pubVal = parseFloat(adminPublicMult.value) || 1.0;
  const smVal = parseFloat(adminSmMult.value) || 1.2;
  
  marketMultipliers.public = pubVal;
  marketMultipliers.sm = smVal;
  
  // Update UI button texts for multipliers
  const pubBtn = document.querySelector('.btn-set-market[data-market="public"]');
  const smBtn = document.querySelector('.btn-set-market[data-market="sm"]');
  if (pubBtn) pubBtn.textContent = `Activate Market (${pubVal.toFixed(2)}x)`;
  if (smBtn) smBtn.textContent = `Activate Market (${smVal.toFixed(2)}x)`;
  
  const marketName = currentMarket === 'public' ? 'Public Market' : 'SM Supermarket';
  lblActiveMarket.textContent = `Active Market: ${marketName} (${marketMultipliers[currentMarket].toFixed(2)}x)`;
  
  calculateTargets();
  alert('Global markups applied successfully!');
});

// Auto-login active session on page reload
// Auto-login active session on page reload or show landing page on first load
const currentUserEmail = localStorage.getItem('blane_current_user');
if (currentUserEmail) {
  const users = JSON.parse(localStorage.getItem('blane_users') || '[]');
  const user = users.find(u => u.email === currentUserEmail);
  if (user) {
    USER_PROFILE = user.profile;
    inputWeight.value = USER_PROFILE.weight || 70;
    document.getElementById('input-budget').value = USER_PROFILE.budget || 300;
    const userProfileGreeting = document.getElementById('lbl-user-name');
    if (userProfileGreeting) {
      userProfileGreeting.textContent = user.name;
    }
    enterDashboard();
  } else {
    showLandingScreen();
  }
} else {
  showLandingScreen();
}

console.log('BLANE App Initialized successfully.');

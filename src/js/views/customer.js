// customer.js - View controller for Customer screens

import { store } from '../store.js';
import { dataLoader } from '../data-loader.js';
import { renderMealCard, renderCategoryChips, renderRatingStars } from '../components/cards.js';
import { renderPagination } from '../components/table.js';
import { renderTrackingStepper, renderMockMap } from '../components/tracking.js';

// Local catalog state
let catalogFilters = {
  search: '',
  category: 'All',
  sortBy: 'name',
  page: 1,
  limit: 12
};

let trackOrderResult = null;

let sharedPaymentSelections = {
  Sarah: 'online',
  Alex: 'online',
  John: 'cash',
  Emily: 'online'
};

let sharedPaymentStatuses = {
  Sarah: 'pending',
  Alex: 'paid',
  John: 'cash',
  Emily: 'pending'
};

let sharedOnlinePaymentChannels = {
  Sarah: 'qr',
  Alex: 'tng',
  John: 'qr',
  Emily: 'duitnow'
};

const sharedOrderRows = [
  { id: 1, customer: 'Sarah', avatar: 'SR', item: 'Chicken Dumplings', qty: 2, price: 12.00, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=80' },
  { id: 2, customer: 'Sarah', avatar: 'SR', item: 'Iced Tea', qty: 1, price: 4.00, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&auto=format&fit=crop&q=80' },
  { id: 3, customer: 'Alex', avatar: 'AL', item: 'Shrimp Dumplings', qty: 1, price: 9.00, image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&auto=format&fit=crop&q=80' },
  { id: 4, customer: 'John', avatar: 'JN', item: 'Fried Dumplings', qty: 2, price: 14.00, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=200&auto=format&fit=crop&q=80' },
  { id: 5, customer: 'Emily', avatar: 'EM', item: 'Jasmine Tea', qty: 2, price: 6.00, image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=200&auto=format&fit=crop&q=80' },
  { id: 6, customer: 'Alex', avatar: 'AL', item: 'Signature Dumpling Platter', qty: 2, price: 18.50, image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=200&auto=format&fit=crop&q=80' },
  { id: 7, customer: 'Emily', avatar: 'EM', item: 'Chili Oil Wontons', qty: 2, price: 15.00, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&auto=format&fit=crop&q=80' }
];

const avatarTone = {
  Sarah: 'bg-pink-400',
  Alex: 'bg-blue-400',
  John: 'bg-indigo-500',
  Emily: 'bg-amber-500'
};

function statusBadge(status) {
  if (status === 'paid') {
    return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Paid</span>';
  }
  if (status === 'cash') {
    return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Cash Collection</span>';
  }
  return '<span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">Pending</span>';
}

function collectSharedSummary() {
  const participants = Object.keys(sharedPaymentSelections);
  const grouped = participants.map((name) => {
    const rows = sharedOrderRows.filter((row) => row.customer === name);
    const subtotal = rows.reduce((sum, row) => sum + row.price, 0);
    return {
      name,
      avatar: rows[0]?.avatar || name.slice(0, 2).toUpperCase(),
      rows,
      subtotal,
      method: sharedPaymentSelections[name] || 'online',
      status: sharedPaymentStatuses[name] || 'pending'
    };
  });

  const totalItems = sharedOrderRows.reduce((sum, row) => sum + row.qty, 0);
  const grandTotal = sharedOrderRows.reduce((sum, row) => sum + row.price, 0);
  const paidCount = grouped.filter((g) => g.status === 'paid').length;
  const pendingCount = grouped.length - paidCount;

  return { grouped, totalItems, grandTotal, paidCount, pendingCount, totalParticipants: grouped.length };
}

export const customerViews = {

  // ─── 1. LANDING PAGE ────────────────────────────────────────────────────────
  renderHome(container) {
    const featuredMeals = [...store.state.meals]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    const categories = ['All', 'Dumplings', 'Soup Noodles', 'Dry Noodles', 'Fried Noodles', 'Rice', 'Drinks'];

    container.innerHTML = `
      <div id="premium-hero-root"></div>

      <!-- ── Promotions ──────────────────────────────────────────────────── -->
      <section id="promotions" class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold font-display text-primary">Ongoing Promotions</h2>
          <span class="text-xs text-secondary-light bg-accent/10 text-accent px-3 py-1 rounded-full font-semibold border border-accent/20">Limited Time</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

          <!-- Promo 1 -->
          <div class="relative bg-gradient-to-br from-accent to-accent-dark rounded-3xl p-6 text-white overflow-hidden shadow-accent-glow">
            <div class="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"></div>
            <span class="text-4xl block mb-3">🎁</span>
            <h3 class="font-display font-bold text-lg mb-1">Buy 2 Packs, Free Delivery</h3>
            <p class="text-white/80 text-xs leading-relaxed mb-4">Order any 2 packs of dumplings and enjoy free campus delivery. Valid all day, every day.</p>
            <button onclick="window.app.switchView('catalog')" class="bg-white text-accent font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-all cursor-pointer active:scale-95">
              Order Now →
            </button>
          </div>

          <!-- Promo 2 -->
          <div class="relative bg-gradient-to-br from-primary to-primary-light rounded-3xl p-6 text-white overflow-hidden shadow-premium">
            <div class="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5"></div>
            <span class="text-4xl block mb-3">💰</span>
            <h3 class="font-display font-bold text-lg mb-1">Combo Pack 20% OFF</h3>
            <p class="text-white/70 text-xs leading-relaxed mb-4">All Combo Pack products are now 20% off. Stock your freezer and save big this month!</p>
            <button onclick="window.app.setCatalogCategory('Combo Pack'); window.app.switchView('catalog');" class="bg-accent text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-accent-dark transition-all cursor-pointer active:scale-95">
              Shop Combos →
            </button>
          </div>

          <!-- Promo 3 -->
          <div class="relative bg-gradient-to-br from-success to-success-dark rounded-3xl p-6 text-white overflow-hidden shadow-premium">
            <div class="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10"></div>
            <span class="text-4xl block mb-3">🎓</span>
            <h3 class="font-display font-bold text-lg mb-1">Student Bundle — RM 22.90</h3>
            <p class="text-white/80 text-xs leading-relaxed mb-4">30pcs of crispy chicken dumplings at an unbeatable student price. Show your UTM matric card!</p>
            <button onclick="window.app.switchView('catalog'); window.app.setCatalogCategory('Combo Pack');" class="bg-white text-success font-bold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-all cursor-pointer active:scale-95">
              Get Bundle →
            </button>
          </div>

        </div>
      </section>

      <!-- ── Category Quick-Nav ─────────────────────────────────────────── -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold font-display text-primary">Browse by Type</h2>
          <button onclick="window.app.switchView('catalog')" class="text-sm font-semibold text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer">
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </button>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scroll-smooth">
          ${renderCategoryChips(categories, 'All', 'setCatalogCategory')}
        </div>
      </section>

      <!-- ── Featured Dishes ───────────────────────────────────────────── -->
      <section class="mb-12">
        <h2 class="text-2xl font-bold font-display text-primary mb-2">Top-Rated Dishes</h2>
        <p class="text-sm text-secondary-light mb-6">Our highest-rated items, loved by students across UTM campus.</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featuredMeals.map(meal => renderMealCard(meal)).join('')}
        </div>
      </section>

      <!-- ── How to Order ────────────────────────────────────────────────── -->
      <section class="glass-card rounded-[2rem] p-8 border border-secondary/5 mb-12">
        <h3 class="font-display text-xl font-bold text-primary mb-6 text-center">How to Order</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div class="space-y-3">
            <div class="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto text-2xl">1️⃣</div>
            <h4 class="font-display font-bold text-sm text-primary">Browse & Add to Cart</h4>
            <p class="text-xs text-secondary-light leading-relaxed">Choose your favourite dumpling varieties and add them to your cart.</p>
          </div>
          <div class="space-y-3">
            <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto text-2xl">2️⃣</div>
            <h4 class="font-display font-bold text-sm text-primary">Fill in Your Details</h4>
            <p class="text-xs text-secondary-light leading-relaxed">Enter your name, room number, and preferred pickup or delivery time.</p>
          </div>
          <div class="space-y-3">
            <div class="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success mx-auto text-2xl">3️⃣</div>
            <h4 class="font-display font-bold text-sm text-primary">Collect & Enjoy!</h4>
            <p class="text-xs text-secondary-light leading-relaxed">Pick up from KTF & Alumni UTM or wait for campus delivery. Ready in 12–15 mins!</p>
          </div>
        </div>
        <div class="text-center mt-8">
          <button onclick="window.app.switchView('catalog')" class="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 text-sm">
            Start Ordering Now
          </button>
        </div>
      </section>
    `;

    const premiumHeroRoot = container.querySelector('#premium-hero-root');
    if (premiumHeroRoot) {
      import('../../react/PremiumHero.jsx').then(({ mountPremiumHero }) => {
        if (premiumHeroRoot.isConnected) mountPremiumHero(premiumHeroRoot);
      });
    }
  },

  // ─── 2. FOOD ORDERING CATALOG ───────────────────────────────────────────────
  renderCatalog(container) {
    const categories = ['All', 'Dumplings', 'Soup Noodles', 'Dry Noodles', 'Fried Noodles', 'Rice', 'Drinks'];
    const results = dataLoader.queryMeals(catalogFilters);

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-6">
            <div>
              <h3 class="font-display font-bold text-lg text-primary mb-4">Filter Menu</h3>
              <!-- Search -->
              <div class="relative">
                <input
                  type="text"
                  id="catalogSearch"
                  value="${catalogFilters.search}"
                  oninput="window.app.catalogSearch(this.value)"
                  placeholder="Search menu..."
                  class="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-sm"
                />
                <svg class="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>

            <!-- Category -->
            <div>
              <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light mb-3">Category</h4>
              <div class="flex flex-col gap-2">
                ${categories.map(cat => {
                  const icons = { All: '🍽️', Dumplings: '🥟', 'Soup Noodles': '🍜', 'Dry Noodles': '🥢', 'Fried Noodles': '🥘', Rice: '🍚', Drinks: '🥤' };
                  const isActive = cat === catalogFilters.category;
                  return `
                    <button
                      onclick="window.app.setCatalogCategory('${cat}')"
                      class="text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-between ${isActive ? 'bg-accent/15 text-accent-dark font-semibold' : 'text-secondary hover:bg-background/60'}"
                    >
                      <span class="flex items-center gap-2">${icons[cat] || ''} ${cat}</span>
                      ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-accent"></span>' : ''}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Sort -->
            <div>
              <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light mb-3">Sort By</h4>
              <select
                onchange="window.app.catalogSort(this.value)"
                class="w-full px-3 py-2.5 bg-background border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="name" ${catalogFilters.sortBy === 'name' ? 'selected' : ''}>Alphabetical</option>
                <option value="price-asc" ${catalogFilters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-desc" ${catalogFilters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating" ${catalogFilters.sortBy === 'rating' ? 'selected' : ''}>Customer Rating</option>
              </select>
            </div>

            <!-- Halal badge -->
            <div class="bg-success/10 border border-success/20 rounded-2xl p-4 text-center">
              <span class="text-2xl block mb-1">✅</span>
              <p class="text-xs font-bold text-success">All Products JAKIM Halal Certified</p>
              <p class="text-[10px] text-secondary-light mt-1">No pork, no lard, no alcohol ingredients.</p>
            </div>
          </div>
        </aside>

        <!-- Main Catalog -->
        <main class="flex-grow">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold font-display text-primary">Our Menu</h2>
              <p class="text-xs text-secondary-light mt-1">${results.total} products available${catalogFilters.category !== 'All' ? ` in <strong>${catalogFilters.category}</strong>` : ''}</p>
            </div>
          </div>

          ${results.items.length === 0 ? `
            <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
              <div class="text-5xl mb-4">🍽️</div>
              <p class="font-display font-semibold text-primary mb-2">No items found</p>
              <p class="text-xs text-secondary-light">Try adjusting your search or filters.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              ${results.items.map(meal => renderMealCard(meal)).join('')}
            </div>
            ${renderPagination(results.page, results.totalPages, 'catalogPage')}
          `}
        </main>
      </div>
    `;
  },

  setCatalogCategory(cat) {
    catalogFilters.category = cat;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  catalogSort(sortBy) {
    catalogFilters.sortBy = sortBy;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  catalogSearch(search) {
    catalogFilters.search = search;
    catalogFilters.page = 1;
    this.refreshCatalog();
  },

  catalogPage(page) {
    catalogFilters.page = page;
    this.refreshCatalog();
  },

  refreshCatalog() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'catalog' && container) {
      this.renderCatalog(container);
    }
  },

  // ─── Meal Details Modal ──────────────────────────────────────────────────────
  renderMealDetails(mealId) {
    const meal = store.state.meals.find(m => m.mealId === mealId);
    if (!meal) return '';

    const reviews = dataLoader.getMealRatings(mealId);

    return `
      <div class="relative bg-white rounded-3xl max-w-4xl w-full mx-4 overflow-hidden border border-secondary/10 shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-slide-up">

        <!-- Left: Image -->
        <div class="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-background-dark">
          <img src="${meal.image}" alt="${meal.mealName}" class="w-full h-full object-cover"
            onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'" />
          <button onclick="window.app.closeMealDetails()" class="absolute top-4 left-4 md:hidden bg-white/90 backdrop-blur-md p-2 rounded-full text-primary shadow-md cursor-pointer hover:bg-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-success border border-success/20">
            ✅ Halal
          </div>
        </div>

        <!-- Right: Details -->
        <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <button onclick="window.app.closeMealDetails()" class="hidden md:flex absolute top-6 right-6 bg-background hover:bg-background-dark p-2 rounded-full text-secondary hover:text-primary transition-all cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div class="space-y-5">
            <div>
              <span class="text-xs font-semibold text-accent uppercase tracking-wider">${meal.category}</span>
              <h2 class="font-display text-2xl font-bold text-primary mt-1">${meal.mealName}</h2>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex text-accent">${renderRatingStars(meal.rating)}</div>
                <span class="text-xs font-semibold text-primary">${meal.rating.toFixed(1)}</span>
                <span class="text-xs text-secondary-light">(${reviews.length} reviews)</span>
              </div>
            </div>

            <div>
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Description</h4>
              <p class="text-charcoal-light text-xs leading-relaxed">${meal.description}</p>
            </div>

            <div>
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">Key Ingredients</h4>
              <div class="flex flex-wrap gap-1.5">
                ${meal.ingredients.map(ing => `<span class="bg-background text-secondary text-[10px] px-2.5 py-1 rounded-md border border-secondary/5 font-medium">${ing}</span>`).join('')}
              </div>
            </div>

            <div class="flex items-center gap-4 py-3 border-y border-secondary/5 text-xs text-secondary-light">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Ready in ${meal.prepTime} mins
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
                JAKIM Halal
              </span>
            </div>

            <div class="space-y-3">
              <h4 class="font-display text-xs font-bold text-secondary uppercase tracking-wider">Customer Reviews</h4>
              <div class="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                ${reviews.length === 0 ? `<p class="text-xs text-secondary-light italic">No reviews yet. Be the first!</p>` :
                  reviews.map(rev => `
                    <div class="bg-background/50 border border-secondary/5 rounded-xl p-3 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-primary font-display">${rev.customerName}</span>
                        <div class="flex text-accent">${renderRatingStars(rev.rating)}</div>
                      </div>
                      <p class="text-[11px] text-charcoal-light italic leading-relaxed">"${rev.review}"</p>
                    </div>
                  `).join('')
                }
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between border-t border-secondary/5 pt-4 mt-6">
            <div>
              <span class="text-xs text-secondary-light">Price per pack</span>
              <span class="text-xl font-extrabold text-primary block font-display">RM ${meal.price.toFixed(2)}</span>
            </div>
            <button
              onclick="if (window.app.addToCart('${meal.mealId}')) { window.app.closeMealDetails(); }"
              class="bg-accent hover:bg-accent-dark text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ─── Cart Drawer ─────────────────────────────────────────────────────────────
  renderCartDrawer() {
    const drawerContainer = document.getElementById('cart-drawer-items');
    const footerContainer = document.getElementById('cart-drawer-footer');
    if (!drawerContainer || !footerContainer) return;

    const cart = store.state.cart;
    const session = store.state.tableSession;

    const tablePickerMarkup = `
      <div class="space-y-4">
        <div class="bg-primary/5 border border-primary/15 rounded-2xl p-4">
          <p class="text-xs font-bold uppercase tracking-wider text-primary mb-1">Step 1</p>
          <h4 class="font-display text-sm font-bold text-primary">Choose Table For Shared Cart</h4>
          <p class="text-xs text-secondary-light mt-1">Select the same table as your members, enter your name, then start adding items.</p>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-semibold text-secondary-light block">Your Name</label>
          <input id="cart-session-name" type="text" placeholder="e.g. Sarah" class="form-input-premium text-sm py-2.5" />
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold text-secondary-light">Select Table</p>
          <div id="table-picker-grid" class="grid grid-cols-4 gap-2">
            ${['T01','T02','T03','T04','T05','T06','T07','T08'].map(table => `
              <button
                type="button"
                data-table="${table}"
                class="table-btn h-10 rounded-xl border border-secondary/10 bg-white text-secondary text-xs font-semibold transition-all hover:border-primary/40"
              >
                ${table}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-xs font-semibold text-secondary-light">Current Members</p>
          <div id="cart-members-list" class="flex flex-wrap gap-2 min-h-[34px] items-center rounded-xl border border-secondary/10 bg-background px-2.5 py-2">
            <span class="text-xs text-secondary-light italic">Select a table to view members.</span>
          </div>
        </div>
      </div>
    `;

    const wireTablePicker = () => {
      requestAnimationFrame(() => {
        const grid = document.getElementById('table-picker-grid');
        if (!grid) return;

        const currentTable = session?.tableNo || window._chosenTable || null;
        const paintMembers = (tableNo) => {
          const members = window._tableMembers?.[tableNo] || [];
          const list = document.getElementById('cart-members-list');
          if (!list) return;
          if (!tableNo) {
            list.innerHTML = '<span class="text-xs text-secondary-light italic">Select a table to view members.</span>';
            return;
          }
          if (members.length === 0) {
            list.innerHTML = '<span class="text-xs text-secondary-light italic">No members yet - be the first!</span>';
            return;
          }
          list.innerHTML = members.map(m => `
            <span class="flex items-center gap-1.5 bg-background border border-secondary/10 rounded-full pl-1 pr-3 py-0.5">
              <span class="w-5 h-5 rounded-full ${m.tone} text-white text-[9px] font-bold flex items-center justify-center">${m.av}</span>
              <span class="text-xs font-medium text-primary">${m.name}</span>
            </span>
          `).join('');
        };

        grid.querySelectorAll('.table-btn').forEach(btn => {
          const isActive = currentTable && btn.dataset.table === currentTable;
          if (isActive) {
            btn.classList.add('bg-primary', 'text-white', 'border-primary', 'shadow-md');
            btn.classList.remove('border-secondary/10', 'bg-white', 'text-secondary');
            window._chosenTable = btn.dataset.table;
          }

          btn.addEventListener('click', () => {
            grid.querySelectorAll('.table-btn').forEach(b => {
              b.classList.remove('bg-primary', 'text-white', 'border-primary', 'shadow-md');
              b.classList.add('border-secondary/10', 'bg-white', 'text-secondary');
            });
            btn.classList.add('bg-primary', 'text-white', 'border-primary', 'shadow-md');
            btn.classList.remove('border-secondary/10', 'bg-white', 'text-secondary');
            window._chosenTable = btn.dataset.table;
            paintMembers(btn.dataset.table);
          });
        });

        paintMembers(window._chosenTable || currentTable);
      });
    };

    if (!session) {
      drawerContainer.innerHTML = tablePickerMarkup;
      footerContainer.innerHTML = `
        <div class="space-y-2">
          <button
            onclick="window.app.confirmJoinTable()"
            class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
          >
            Join Table & Start Shared Cart
          </button>
          <button
            onclick="window.app.switchView('catalog'); window.app.closeCartDrawer();"
            class="w-full bg-white border border-secondary/15 text-secondary hover:bg-background-dark font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
          >
            Browse Meals
          </button>
        </div>
      `;
      wireTablePicker();
      return;
    }

    const groupedCart = Object.values(cart.reduce((acc, item) => {
      const meal = store.state.meals.find((m) => m.mealId === item.mealId);
      if (!meal) return acc;
      if (!acc[item.mealId]) {
        acc[item.mealId] = {
          mealId: item.mealId,
          mealName: meal.mealName,
          image: meal.image,
          unitPrice: meal.price,
          quantity: 0,
          total: 0,
          members: new Set()
        };
      }
      acc[item.mealId].quantity += item.quantity;
      acc[item.mealId].total += meal.price * item.quantity;
      acc[item.mealId].members.add(item.addedBy || session.myName);
      return acc;
    }, {}));

    const tableMembers = session.members || [];
    const memberMap = (tableMembers || []).reduce((acc, member) => {
      acc[member.name] = member;
      return acc;
    }, {});

    const memberOrderSummary = Object.values(cart.reduce((acc, item) => {
      const memberName = item.addedBy || session.myName;
      const meal = store.state.meals.find((m) => m.mealId === item.mealId);
      if (!meal) return acc;

      if (!acc[memberName]) {
        const meta = memberMap[memberName] || {};
        acc[memberName] = {
          name: memberName,
          avatar: meta.avatar || memberName.slice(0, 2).toUpperCase(),
          tone: meta.tone || 'bg-secondary',
          items: {}
        };
      }

      if (!acc[memberName].items[item.mealId]) {
        acc[memberName].items[item.mealId] = {
          mealName: meal.mealName,
          quantity: 0
        };
      }

      acc[memberName].items[item.mealId].quantity += item.quantity;
      return acc;
    }, {}));

    const otherMemberOrders = memberOrderSummary.filter((entry) => entry.name !== session.myName);

    if (cart.length === 0) {
      drawerContainer.innerHTML = `
        <div class="space-y-4">
          <div class="rounded-2xl border border-secondary/10 bg-background p-4">
            <div class="flex items-center justify-between gap-2">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-secondary-light">Shared Table</p>
                <h4 class="font-display text-sm font-bold text-primary mt-0.5">${session.tableNo}</h4>
              </div>
              <button onclick="window.app.leaveTable()" class="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-secondary/15 text-secondary hover:bg-white transition-colors cursor-pointer">Change Table</button>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3">
              ${tableMembers.map(member => `
                <span class="flex items-center gap-1.5 bg-white border border-secondary/10 rounded-full pl-1 pr-2.5 py-0.5">
                  <span class="w-5 h-5 rounded-full ${member.tone} text-white text-[9px] font-bold flex items-center justify-center">${member.avatar}</span>
                  <span class="text-[11px] font-medium text-primary">${member.name}</span>
                </span>
              `).join('')}
            </div>
          </div>

          <div class="py-14 text-center text-secondary">
            <svg class="w-16 h-16 mx-auto mb-4 text-secondary/20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            <p class="font-display font-semibold text-primary mb-1">No shared items yet</p>
            <p class="text-xs text-secondary-light">Add dumplings for table ${session.tableNo} to build your shared cart.</p>
          </div>
        </div>
      `;

      footerContainer.innerHTML = `
        <button
          onclick="window.app.switchView('catalog'); window.app.closeCartDrawer();"
          class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm"
        >
          Add Items For ${session.tableNo}
        </button>
      `;
      return;
    }

    drawerContainer.innerHTML = `
      <div class="space-y-4">
        <div class="rounded-2xl border border-secondary/10 bg-background p-4 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-secondary-light">Shared Table</p>
              <h4 class="font-display text-sm font-bold text-primary mt-0.5">${session.tableNo} - Shared Cart</h4>
            </div>
            <button onclick="window.app.leaveTable()" class="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-secondary/15 text-secondary hover:bg-white transition-colors cursor-pointer">Change Table</button>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${tableMembers.map(member => `
              <span class="flex items-center gap-1.5 bg-white border border-secondary/10 rounded-full pl-1 pr-2.5 py-0.5">
                <span class="w-5 h-5 rounded-full ${member.tone} text-white text-[9px] font-bold flex items-center justify-center">${member.avatar}</span>
                <span class="text-[11px] font-medium text-primary">${member.name}</span>
              </span>
            `).join('')}
          </div>
        </div>

        ${groupedCart.map(item => `
          <div class="flex items-center gap-3 p-3.5 bg-background rounded-2xl border border-secondary/5">
            <img src="${item.image}" alt="${item.mealName}" class="w-14 h-14 rounded-xl object-cover border border-secondary/10" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'"/>
            <div class="flex-grow min-w-0 space-y-1">
              <h4 class="font-display font-semibold text-sm text-primary truncate">${item.mealName}</h4>
              <p class="text-[11px] text-secondary-light">RM ${item.unitPrice.toFixed(2)} each</p>
              <p class="text-[11px] text-secondary-light truncate">Added by: ${Array.from(item.members).join(', ')}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-primary">x${item.quantity}</p>
              <p class="text-xs font-display font-bold text-primary">RM ${item.total.toFixed(2)}</p>
            </div>
          </div>
        `).join('')}

        <div class="rounded-2xl border border-secondary/10 bg-white p-4 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-display text-sm font-bold text-primary">Other Members' Orders</h4>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">${otherMemberOrders.length}</span>
          </div>

          ${otherMemberOrders.length === 0 ? `
            <p class="text-xs text-secondary-light">No other members have added items yet.</p>
          ` : `
            <div class="space-y-2.5">
              ${otherMemberOrders.map((member) => `
                <div class="rounded-xl border border-secondary/10 bg-background p-3 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded-full ${member.tone} text-white text-[10px] font-bold flex items-center justify-center">${member.avatar}</span>
                    <p class="text-xs font-semibold text-primary">${member.name}</p>
                  </div>
                  <div class="space-y-1.5">
                    ${Object.values(member.items).map((entry) => `
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="text-secondary truncate pr-2">${entry.mealName}</span>
                        <span class="font-semibold text-primary">x${entry.quantity}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Load Footer calculations
    const subtotal = store.getCartTotal();

    footerContainer.innerHTML = `
      <div class="space-y-2.5 mb-6 text-xs">
        <div class="flex items-center justify-between text-secondary-light">
          <span>Subtotal</span>
          <span>RM ${subtotal.toFixed(2)}</span>
        </div>
        <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
          <span>Grand Total</span>
          <span class="font-display">RM ${subtotal.toFixed(2)}</span>
        </div>
      </div>
      <div class="space-y-2">
        <button
          onclick="window.app.switchView('review-shared-order'); window.app.closeCartDrawer();"
          class="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm"
        >
          Review Shared Order
        </button>
        <button
          onclick="window.app.switchView('catalog'); window.app.closeCartDrawer();"
          class="w-full bg-white border border-secondary/15 text-secondary hover:bg-background-dark font-semibold py-3 rounded-2xl transition-all cursor-pointer text-sm"
        >
          Add More Items
        </button>
      </div>
    `;
  },

  // ─── 3. CHECKOUT & ORDER CONFIRMATION ────────────────────────────────────────
  renderCheckout(container) {
    const cart = store.state.cart;
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
          <div class="text-5xl mb-4">🛒</div>
          <p class="font-display font-bold text-lg text-primary mb-2">Your cart is empty</p>
          <p class="text-xs text-secondary-light mb-6">Add some food to your cart before checking out.</p>
          <button onclick="window.app.switchView('catalog')" class="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-xs">Order Food</button>
        </div>
      `;
      return;
    }

    const subtotal = store.getCartTotal();
    const deliveryFee = cart.length >= 2 ? 0 : 3.00;
    const total = subtotal + deliveryFee;

    container.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Checkout Form -->
        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Delivery / Pickup Details</h2>

            <form id="checkoutForm" onsubmit="event.preventDefault(); window.app.submitCheckout(new FormData(this))" class="space-y-4">
              <!-- Name & Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Full Name <span class="text-accent">*</span></label>
                  <input type="text" name="name" required placeholder="e.g. Ahmad bin Ali" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Phone Number <span class="text-accent">*</span></label>
                  <input type="tel" name="phone" required placeholder="e.g. 012-345 6789" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>

              <!-- Room / Address -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Room / Delivery Address at UTM <span class="text-accent">*</span></label>
                <input type="text" name="address" required placeholder="e.g. KTF Blok A, Bilik 203 / Alumni Hostel Blok B" class="form-input-premium text-sm py-2.5" />
              </div>

              <!-- Matric No (optional) -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Matric No. <span class="text-secondary-light font-normal">(optional — for student promos)</span></label>
                <input type="text" name="matric" placeholder="e.g. A21CS1234" class="form-input-premium text-sm py-2.5" />
              </div>

              <!-- Pickup / Delivery preference -->
              <div class="pt-4 border-t border-secondary/5">
                <h3 class="font-display font-semibold text-sm text-primary mb-3">Fulfilment Method</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="fulfil" value="pickup" checked class="accent-accent" />
                    <div>
                      <span class="text-sm font-medium text-primary font-display block">Self Pickup</span>
                      <span class="text-[10px] text-secondary-light">Collect at KTF & Alumni UTM counter</span>
                    </div>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="fulfil" value="delivery" class="accent-accent" />
                    <div>
                      <span class="text-sm font-medium text-primary font-display block">Campus Delivery (+RM ${deliveryFee > 0 ? deliveryFee.toFixed(2) : '0.00'})</span>
                      <span class="text-[10px] text-secondary-light">Delivered to your hostel room</span>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="pt-4 border-t border-secondary/5">
                <h3 class="font-display font-semibold text-sm text-primary mb-3">Payment Method</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="online" checked class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Online Transfer</span>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="ewallet" class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Touch 'n Go / DuitNow</span>
                  </label>
                  <label class="flex items-center gap-3 p-4 bg-background border border-secondary/15 rounded-2xl cursor-pointer hover:border-accent/40 transition-colors">
                    <input type="radio" name="payment" value="cash" class="accent-accent" />
                    <span class="text-sm font-medium text-primary font-display">Cash on Pickup</span>
                  </label>
                </div>
              </div>

              <!-- Buttons -->
              <div class="pt-6 border-t border-secondary/5 flex justify-end gap-3">
                <button type="button" onclick="window.app.switchView('catalog')" class="px-6 py-3 border border-secondary/15 rounded-2xl text-secondary hover:bg-background-dark font-medium text-sm transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">
                  Place Order — RM ${total.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </main>

        <!-- Order Summary sidebar -->
        <aside class="w-full lg:w-96 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-6">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4">Order Summary</h3>
            <div class="space-y-4 max-h-[240px] overflow-y-auto pr-1">
              ${cart.map(item => {
                const meal = store.state.meals.find(m => m.mealId === item.mealId);
                if (!meal) return '';
                return `
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2.5">
                      <img src="${meal.image}" alt="${meal.mealName}" class="w-10 h-10 rounded-lg object-cover"
                        onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" />
                      <div>
                        <span class="font-bold text-primary font-display line-clamp-1">${meal.mealName}</span>
                        <span class="text-secondary-light">Qty: ${item.quantity}</span>
                      </div>
                    </div>
                    <span class="font-semibold text-primary font-display">RM ${(meal.price * item.quantity).toFixed(2)}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="space-y-2 border-t border-secondary/5 pt-4 text-xs">
              <div class="flex items-center justify-between text-secondary-light">
                <span>Subtotal</span><span>RM ${subtotal.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-secondary-light">
                <span>Delivery</span>
                <span class="${deliveryFee === 0 ? 'text-success font-semibold' : ''}">${deliveryFee === 0 ? 'FREE' : 'RM ' + deliveryFee.toFixed(2)}</span>
              </div>
              <div class="flex items-center justify-between text-sm font-bold text-primary pt-2.5 border-t border-secondary/10">
                <span>Total</span><span class="font-display">RM ${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;
  },

  submitCheckout(formData) {
    const address = formData.get('address');
    const name = formData.get('name');
    const phone = formData.get('phone');
    const matric = formData.get('matric') || '';
    const fulfil = formData.get('fulfil') || 'pickup';
    const payment = formData.get('payment') || 'cash';

    store.placeOrder({ address, name, phone, matric, fulfil, payment });
  },

  // ─── Order Confirmation Screen ───────────────────────────────────────────────
  renderConfirmation(container) {
    const activeOrder = store.state.activeOrder;
    if (!activeOrder) {
      window.app.switchView('home');
      return;
    }

    const cartItems = store.state.confirmedCartSnapshot || [];
    const tracking = store.state.delivery.find(d => d.orderId === activeOrder.orderId);

    container.innerHTML = `
      <section class="max-w-2xl mx-auto animate-slide-up">
        <!-- Success header -->
        <div class="text-center mb-8 space-y-3">
          <div class="w-20 h-20 bg-success/15 border-4 border-success/30 rounded-full flex items-center justify-center mx-auto text-4xl">
            ✅
          </div>
          <h1 class="font-display text-3xl font-extrabold text-primary">Order Confirmed!</h1>
          <p class="text-secondary-light text-sm">Thank you for ordering from Hot Meal Ba. Your dumplings are being prepared!</p>
        </div>

        <!-- Order details card -->
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-success/20 bg-success/5 space-y-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-secondary/10 pb-5">
            <div>
              <span class="text-[10px] text-success font-bold uppercase tracking-widest block mb-1">Order Reference</span>
              <h2 class="font-display text-2xl font-extrabold text-primary">#${activeOrder.orderId}</h2>
            </div>
            <div class="text-left sm:text-right">
              <span class="text-[10px] text-secondary-light block">Total Paid</span>
              <span class="text-2xl font-extrabold text-primary font-display">RM ${activeOrder.amount.toFixed(2)}</span>
            </div>
          </div>

          <!-- Customer info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-2">Customer Details</span>
              <div class="space-y-1.5 text-charcoal">
                <p><span class="text-secondary-light">Name:</span> <strong>${tracking && tracking.details ? tracking.details.name : '—'}</strong></p>
                <p><span class="text-secondary-light">Phone:</span> ${tracking && tracking.details ? tracking.details.phone : '—'}</p>
                <p><span class="text-secondary-light">Address:</span> ${tracking && tracking.details ? tracking.details.address : '—'}</p>
              </div>
            </div>
            <div>
              <span class="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-2">Fulfilment Info</span>
              <div class="space-y-1.5 text-charcoal">
                <p><span class="text-secondary-light">Method:</span> <strong>${tracking && tracking.details && tracking.details.fulfil === 'delivery' ? '🛵 Campus Delivery' : '🏪 Self Pickup at KTF & Alumni UTM'}</strong></p>
                <p><span class="text-secondary-light">Payment:</span> ${tracking && tracking.details ? ({online: 'Online Transfer', ewallet: "Touch 'n Go / DuitNow", cash: 'Cash on Pickup'}[tracking.details.payment] || tracking.details.payment) : '—'}</p>
                <p><span class="text-secondary-light">Est. Ready:</span> <strong>${tracking ? tracking.estimatedTime : '~15 mins'}</strong></p>
              </div>
            </div>
          </div>

          <!-- Items ordered -->
          ${cartItems.length > 0 ? `
            <div class="border-t border-secondary/10 pt-4">
              <span class="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-3">Items Ordered</span>
              <div class="space-y-2">
                ${cartItems.map(item => {
                  const meal = store.state.meals.find(m => m.mealId === item.mealId);
                  if (!meal) return '';
                  return `
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-charcoal font-medium">${meal.mealName} <span class="text-secondary-light">× ${item.quantity}</span></span>
                      <span class="font-semibold text-primary">RM ${(meal.price * item.quantity).toFixed(2)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- What's next -->
        <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 mb-6 space-y-4">
          <h3 class="font-display font-semibold text-base text-primary">What Happens Next?</h3>
          <div class="space-y-3 text-xs text-charcoal-light">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
              <p>Our team is preparing your dumpling packs right now.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
              <p>${tracking && tracking.details && tracking.details.fulfil === 'delivery' ? 'Your order will be delivered to your room shortly.' : 'Head over to the KTF & Alumni UTM counter to pick up your order.'}</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
              <p>Pan-fry, steam, or boil your dumplings in 12–15 minutes. Enjoy!</p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button onclick="window.app.switchView('tracking')" class="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm text-center">
            Track My Order
          </button>
          <button onclick="window.app.switchView('home')" class="flex-1 bg-white border border-secondary/20 hover:bg-background text-primary font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm text-center">
            Back to Home
          </button>
        </div>
      </section>
    `;
  },

  // ─── Live Order Tracking ─────────────────────────────────────────────────────
  renderTracking(container) {
    const activeOrder = store.state.activeOrder;

    if (!activeOrder) {
      container.innerHTML = `
        <div class="glass-card rounded-[2rem] p-12 text-center text-secondary border border-secondary/5 mt-4">
          <div class="text-5xl mb-4">📦</div>
          <p class="font-display font-bold text-lg text-primary mb-2">No active orders</p>
          <p class="text-xs text-secondary-light mb-6">You have no orders being prepared right now.</p>
          <button onclick="window.app.switchView('catalog')" class="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-xs">Order Food</button>
        </div>
      `;
      return;
    }

    const tracking = store.state.delivery.find(d => d.orderId === activeOrder.orderId);
    const meal = store.state.meals.find(m => m.mealId === activeOrder.mealId);

    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main class="lg:col-span-2 space-y-6">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div>
                <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Live Tracking</span>
                <h2 class="font-display text-2xl font-bold text-primary mt-0.5">Order #${activeOrder.orderId}</h2>
              </div>
              <div class="text-left md:text-right">
                <span class="text-xs text-secondary-light block">Est. Ready Time</span>
                <span class="text-lg font-bold text-primary font-display">${tracking ? tracking.estimatedTime : '--:--'}</span>
              </div>
            </div>
            ${renderTrackingStepper(activeOrder.status)}
            ${renderMockMap(activeOrder.status)}
          </div>
        </main>

        <aside class="space-y-6">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-5">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4">Order Info</h3>
            <div class="text-xs text-charcoal space-y-2 leading-relaxed">
              <p><strong class="text-primary">Customer:</strong> ${tracking && tracking.details ? tracking.details.name : '—'}</p>
              <p><strong class="text-primary">Phone:</strong> ${tracking && tracking.details ? tracking.details.phone : '—'}</p>
              <p><strong class="text-primary">Address:</strong> ${tracking && tracking.details ? tracking.details.address : '—'}</p>
              <p><strong class="text-primary">Fulfilment:</strong> ${tracking && tracking.details && tracking.details.fulfil === 'delivery' ? 'Campus Delivery' : 'Self Pickup'}</p>
            </div>
          </div>

          ${activeOrder.status === 'delivered' ? `
            <div class="glass-card rounded-[2rem] p-6 border border-success/20 bg-success/5 animate-slide-up space-y-4">
              <div>
                <h4 class="font-display font-bold text-base text-primary">Enjoyed your ${meal ? meal.mealName : 'dumplings'}?</h4>
                <p class="text-[11px] text-secondary-light mt-0.5">Share your experience to help other students!</p>
              </div>
              <form onsubmit="event.preventDefault(); window.app.submitRating('${activeOrder.mealId}', this.rating.value, this.review.value)" class="space-y-3">
                <div class="flex items-center gap-1">
                  <span class="text-xs text-secondary-light mr-2">Rating:</span>
                  <select name="rating" required class="bg-white border border-secondary/15 rounded-lg text-xs px-2.5 py-1 focus:outline-none">
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="2">⭐⭐ Poor</option>
                    <option value="1">⭐ Terrible</option>
                  </select>
                </div>
                <textarea name="review" rows="3" placeholder="How were the dumplings? Tell us!" class="form-input-premium text-xs py-2 bg-white" required></textarea>
                <button type="submit" class="w-full bg-success hover:bg-success-dark text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-xs shadow-md">
                  Submit Review
                </button>
              </form>
            </div>
          ` : `
            <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 text-center py-8">
              <div class="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-3">
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h4 class="font-display font-semibold text-sm text-primary mb-1">Preparing Your Dumplings</h4>
              <p class="text-[10px] text-secondary-light">Review becomes available after your order is collected.</p>
            </div>
          `}
        </aside>
      </div>
    `;
  },

  // ─── Track Order Search ──────────────────────────────────────────────────────
  renderTrackOrder(container) {
    const statusLabels = {
      'received': 'Order Received', 'preparing': 'Preparing Pack', 'cooking': 'Packing',
      'out_for_delivery': 'Out for Delivery', 'delivered': 'Collected / Delivered'
    };
    const statusColors = {
      'received': 'bg-blue-100 text-blue-700', 'preparing': 'bg-yellow-100 text-yellow-700',
      'cooking': 'bg-orange-100 text-orange-700', 'out_for_delivery': 'bg-purple-100 text-purple-700',
      'delivered': 'bg-green-100 text-green-700'
    };

    const recentOrders = store.state.orders.slice(0, 8).map(o => {
      const meal = store.state.meals.find(m => m.mealId === o.mealId);
      return { ...o, meal };
    });

    let resultHtml = '';
    if (trackOrderResult) {
      if (trackOrderResult.order) {
        const { order, tracking, meal, customer } = trackOrderResult;
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6 animate-slide-up">
            <div class="flex flex-col md:flex-row md:items-center justify-between border-b border-secondary/5 pb-5 gap-3">
              <div>
                <span class="text-[10px] text-accent font-semibold uppercase tracking-wider">Order Found</span>
                <h2 class="font-display text-2xl font-bold text-primary mt-0.5">#${order.orderId}</h2>
              </div>
              <span class="px-4 py-1.5 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}">
                ${statusLabels[order.status] || order.status}
              </span>
            </div>
            ${renderTrackingStepper(order.status)}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-secondary/5">
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Order Details</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Item:</strong> ${meal ? meal.mealName : 'N/A'}</p>
                  <p><strong class="text-primary">Quantity:</strong> ${order.quantity} pack(s)</p>
                  <p><strong class="text-primary">Amount:</strong> RM ${order.amount.toFixed(2)}</p>
                  <p><strong class="text-primary">Date:</strong> ${new Date(order.orderDate).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div class="space-y-3">
                <h4 class="font-display font-semibold text-xs uppercase tracking-wider text-secondary-light">Delivery Info</h4>
                <div class="text-xs text-charcoal space-y-2 leading-relaxed">
                  <p><strong class="text-primary">Customer:</strong> ${customer ? customer.name : 'Guest'}</p>
                  <p><strong class="text-primary">Est. Ready:</strong> ${tracking ? tracking.estimatedTime : 'N/A'}</p>
                  <p><strong class="text-primary">Handled by:</strong> ${tracking ? tracking.driverName : 'Hot Meal Ba Team'}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        resultHtml = `
          <div class="glass-card rounded-[2rem] p-12 text-center border border-secondary/5">
            <div class="text-4xl mb-4">🔍</div>
            <p class="font-display font-bold text-lg text-primary mb-2">Order Not Found</p>
            <p class="text-xs text-secondary-light">No order matches "<strong>${trackOrderResult.query}</strong>". Please check your order ID and try again.</p>
          </div>
        `;
      }
    } else {
      resultHtml = `
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5">
          <h3 class="font-display font-bold text-lg text-primary mb-4">Recent Orders</h3>
          ${recentOrders.length === 0 ? '<p class="text-xs text-secondary-light text-center py-8">No orders found.</p>' : `
            <div class="space-y-3">
              ${recentOrders.map(o => `
                <button onclick="window.app.trackOrderLookup('${o.orderId}')" class="w-full flex items-center justify-between p-4 bg-background rounded-2xl border border-secondary/5 hover:border-accent/30 hover:bg-white transition-all cursor-pointer text-left">
                  <div class="flex items-center gap-3">
                    ${o.meal ? `<img src="${o.meal.image}" alt="${o.meal.mealName}" class="w-10 h-10 rounded-xl object-cover border border-secondary/10" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'" />` : '<div class="w-10 h-10 rounded-xl bg-background-dark flex items-center justify-center text-lg">🥟</div>'}
                    <div>
                      <span class="font-display font-semibold text-sm text-primary block">${o.orderId}</span>
                      <span class="text-xs text-secondary-light">${o.meal ? o.meal.mealName : 'Dumplings'} · RM ${o.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-[10px] font-bold ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}">${statusLabels[o.status] || o.status}</span>
                </button>
              `).join('')}
            </div>
          `}
        </div>
      `;
    }

    container.innerHTML = `
      <section class="max-w-3xl mx-auto space-y-8">
        <div class="text-center space-y-3">
          <h1 class="font-display text-3xl md:text-4xl font-extrabold text-primary">Track Your Order</h1>
          <p class="text-sm text-secondary-light">Enter your order ID to check the live status of your dumpling order.</p>
        </div>
        <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5">
          <form onsubmit="event.preventDefault(); window.app.trackOrderLookup(this.orderId.value)" class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-grow">
              <input type="text" name="orderId" placeholder="Enter Order ID (e.g. ord_0001)" class="form-input-premium text-sm py-3 pl-11" value="${trackOrderResult ? trackOrderResult.query : ''}" />
              <svg class="w-5 h-5 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button type="submit" class="bg-accent hover:bg-accent-dark text-white font-semibold px-8 py-3 rounded-xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm whitespace-nowrap">Track Order</button>
          </form>
        </div>
        ${resultHtml}
      </section>
    `;
  },

  renderReviewSharedOrder(container) {
    const session = store.state.tableSession;
    const liveCart = store.state.cart;

    // Build rows: live cart if session exists, else static demo data
    let rows;
    let tableNo = 'T05';
    let orderId = 'ORD-7821';

    if (session && liveCart.length > 0) {
      tableNo = session.tableNo;
      orderId = `ORD-${tableNo.slice(1)}${liveCart.length}${liveCart[0].quantity || 1}`;
      rows = liveCart.map((item, i) => {
        const meal = store.state.meals.find(m => m.mealId === item.mealId);
        const who = item.addedBy || session.myName;
        const member = session.members.find(m => m.name === who) || { avatar: who.slice(0,2).toUpperCase(), tone: 'bg-secondary' };
        return {
          id: i + 1,
          customer: who,
          avatar: member.avatar,
          tone: member.tone,
          item: meal ? meal.mealName : 'Unknown Item',
          qty: item.quantity,
          price: meal ? meal.price * item.quantity : 0,
          image: meal ? meal.image : 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200&auto=format&fit=crop&q=80'
        };
      });
    } else {
      rows = sharedOrderRows;
    }

    // Group by participant
    const seenNames = [...new Set(rows.map(r => r.customer))];
    const grouped = seenNames.map(name => {
      const personRows = rows.filter(r => r.customer === name);
      const subtotal = personRows.reduce((s, r) => s + r.price, 0);
      const member = session?.members.find(m => m.name === name);
      return {
        name,
        avatar: member?.avatar || personRows[0]?.avatar || name.slice(0,2).toUpperCase(),
        tone: member?.tone || avatarTone[name] || 'bg-secondary',
        rows: personRows,
        subtotal,
        method: sharedPaymentSelections[name] || 'online',
        onlineChannel: sharedOnlinePaymentChannels[name] || 'qr',
        status: sharedPaymentStatuses[name] || 'pending'
      };
    });

    const totalItems = rows.reduce((s, r) => s + r.qty, 0);
    const grandTotal = rows.reduce((s, r) => s + r.price, 0);
    const paidCount = grouped.filter(g => g.status === 'paid').length;
    const pendingCount = grouped.length - paidCount;
    const progress = grouped.length > 0 ? Math.round((paidCount / grouped.length) * 100) : 0;

    container.innerHTML = `
      <section class="max-w-2xl mx-auto space-y-5 pb-8 animate-fade-in">
        <div class="text-center space-y-1.5">
          <h1 class="font-display text-3xl font-extrabold text-primary">Review Shared Order</h1>
          <p class="text-sm text-secondary-light">Check everyone's orders before payment.</p>
        </div>

        <div class="glass-card rounded-[2rem] p-5 border border-secondary/5 space-y-3">
          <h2 class="font-display font-bold text-base text-primary">Shared Cart Summary</h2>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-background rounded-xl p-3 border border-secondary/5">
              <p class="text-secondary-light font-semibold uppercase tracking-wide text-[10px]">Table No.</p>
              <p class="font-display font-bold text-primary text-sm mt-0.5">${tableNo}</p>
            </div>
            <div class="bg-background rounded-xl p-3 border border-secondary/5">
              <p class="text-secondary-light font-semibold uppercase tracking-wide text-[10px]">Order Number</p>
              <p class="font-display font-bold text-primary text-sm mt-0.5">${orderId}</p>
            </div>
            <div class="bg-background rounded-xl p-3 border border-secondary/5">
              <p class="text-secondary-light font-semibold uppercase tracking-wide text-[10px]">Participants</p>
              <p class="font-display font-bold text-primary text-sm mt-0.5">${grouped.length}</p>
            </div>
            <div class="bg-background rounded-xl p-3 border border-secondary/5">
              <p class="text-secondary-light font-semibold uppercase tracking-wide text-[10px]">Total Items</p>
              <p class="font-display font-bold text-primary text-sm mt-0.5">${totalItems}</p>
            </div>
          </div>
          <div class="bg-primary text-white rounded-xl p-3.5 flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-white/80">Grand Total</span>
            <span class="font-display text-lg font-extrabold">RM ${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div class="glass-card rounded-[2rem] p-5 border border-secondary/5 space-y-3">
          <h2 class="font-display font-bold text-base text-primary">Split Order Table</h2>
          <div class="rounded-2xl border border-secondary/10 overflow-hidden bg-white">
            <div class="grid grid-cols-12 gap-2 px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-secondary-light bg-background border-b border-secondary/10">
              <span class="col-span-3">Customer</span>
              <span class="col-span-5">Menu Ordered</span>
              <span class="col-span-2 text-center">Qty</span>
              <span class="col-span-2 text-right">Price</span>
            </div>
            <div class="divide-y divide-secondary/5 max-h-[320px] overflow-y-auto">
              ${rows.map(row => `
                <div class="grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-xs hover:bg-background/30 transition-colors">
                  <div class="col-span-3 flex items-center gap-2 min-w-0">
                    <div class="w-7 h-7 rounded-full ${row.tone || avatarTone[row.customer] || 'bg-primary'} text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">${row.avatar}</div>
                    <span class="font-medium text-primary truncate">${row.customer}</span>
                  </div>
                  <div class="col-span-5 flex items-center gap-2 min-w-0">
                    <img src="${row.image}" alt="${row.item}" class="w-8 h-8 rounded-lg object-cover border border-secondary/10 flex-shrink-0"/>
                    <span class="text-secondary truncate">${row.item}</span>
                  </div>
                  <div class="col-span-2 text-center font-semibold text-primary">${row.qty}</div>
                  <div class="col-span-2 text-right font-display font-bold text-primary">RM ${row.price.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h2 class="font-display font-bold text-base text-primary px-1">Individual Payment Summary</h2>
          ${grouped.map(entry => `
            <div class="glass-card rounded-[2rem] p-5 border border-secondary/5 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full ${entry.tone} text-white flex items-center justify-center font-bold text-xs">${entry.avatar}</div>
                  <div>
                    <h3 class="font-display text-base font-bold text-primary">${entry.name}</h3>
                    <p class="text-[11px] text-secondary-light">${entry.rows.length} item(s)</p>
                  </div>
                </div>
                ${statusBadge(entry.status)}
              </div>
              <div class="bg-background rounded-2xl p-3 border border-secondary/5 text-xs space-y-1.5">
                ${entry.rows.map(item => `<div class="flex items-center justify-between"><span class="text-secondary">${item.item} ×${item.qty}</span><span class="font-semibold text-primary">RM ${item.price.toFixed(2)}</span></div>`).join('')}
                <div class="pt-2 border-t border-secondary/10 flex items-center justify-between">
                  <span class="text-secondary-light font-semibold">Subtotal</span>
                  <span class="font-display font-bold text-primary">RM ${entry.subtotal.toFixed(2)}</span>
                </div>
              </div>
              <div class="space-y-2">
                <p class="text-[11px] uppercase tracking-wider font-bold text-secondary-light">Payment Method</p>
                <div class="grid grid-cols-2 gap-2">
                  <button onclick="window.app.setSharedPaymentMethod('${entry.name}','online')" class="p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${entry.method === 'online' ? 'bg-success/10 border-success/30 text-success' : 'bg-white border-secondary/15 text-secondary hover:bg-background-dark'}">Online Payment</button>
                  <button onclick="window.app.setSharedPaymentMethod('${entry.name}','cash')" class="p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${entry.method === 'cash' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-secondary/15 text-secondary hover:bg-background-dark'}">Cash Payment</button>
                </div>
              </div>
              ${entry.method === 'online' ? `
                <div class="bg-success/5 border border-success/20 rounded-2xl p-3.5 space-y-3">
                  <div class="grid grid-cols-3 gap-2 text-center">
                    <button onclick="window.app.setSharedOnlinePaymentChannel('${entry.name}','qr')" class="rounded-xl p-2 text-[10px] font-semibold border transition-colors cursor-pointer ${entry.onlineChannel === 'qr' ? 'bg-success/10 border-success/30 text-success' : 'bg-white border-secondary/10 text-secondary hover:bg-background'}">QR</button>
                    <button onclick="window.app.setSharedOnlinePaymentChannel('${entry.name}','tng')" class="rounded-xl p-2 text-[10px] font-semibold border transition-colors cursor-pointer ${entry.onlineChannel === 'tng' ? 'bg-success/10 border-success/30 text-success' : 'bg-white border-secondary/10 text-secondary hover:bg-background'}">Touch 'n Go</button>
                    <button onclick="window.app.setSharedOnlinePaymentChannel('${entry.name}','duitnow')" class="rounded-xl p-2 text-[10px] font-semibold border transition-colors cursor-pointer ${entry.onlineChannel === 'duitnow' ? 'bg-success/10 border-success/30 text-success' : 'bg-white border-secondary/10 text-secondary hover:bg-background'}">DuitNow</button>
                  </div>

                  ${entry.onlineChannel === 'qr' ? `
                    <div class="rounded-xl border border-secondary/10 bg-white p-3 flex items-center gap-3">
                      <div class="w-16 h-16 rounded-lg border border-secondary/10 bg-white p-1 grid grid-cols-5 grid-rows-5 gap-0.5 flex-shrink-0">
                        <span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span>
                        <span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span>
                        <span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span>
                        <span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span>
                        <span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-primary rounded-sm"></span><span class="bg-background rounded-sm"></span><span class="bg-primary rounded-sm"></span>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-primary">Scan QR to pay RM ${entry.subtotal.toFixed(2)}</p>
                        <p class="text-[11px] text-secondary-light">Supported by DuitNow QR and Touch 'n Go.</p>
                      </div>
                    </div>
                  ` : ''}

                  ${entry.onlineChannel === 'tng' ? `
                    <div class="rounded-xl border border-secondary/10 bg-white p-3 space-y-1.5">
                      <p class="text-xs font-semibold text-primary">Touch 'n Go eWallet</p>
                      <p class="text-[11px] text-secondary-light">Merchant ID: TNG-DUMPLING-2026</p>
                      <p class="text-[11px] text-secondary-light">Amount: RM ${entry.subtotal.toFixed(2)}</p>
                    </div>
                  ` : ''}

                  ${entry.onlineChannel === 'duitnow' ? `
                    <div class="rounded-xl border border-secondary/10 bg-white p-3 space-y-1.5">
                      <p class="text-xs font-semibold text-primary">DuitNow Transfer</p>
                      <p class="text-[11px] text-secondary-light">Account: DUMPLING.SHARED@duitnow</p>
                      <p class="text-[11px] text-secondary-light">Ref: ${tableNo}-${entry.name.toUpperCase()}</p>
                      <p class="text-[11px] text-secondary-light">Amount: RM ${entry.subtotal.toFixed(2)}</p>
                    </div>
                  ` : ''}

                  <button onclick="window.app.markParticipantPaid('${entry.name}')" class="w-full bg-success hover:bg-success-dark text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer text-sm">Pay Now</button>
                </div>
              ` : `
                <div class="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base">💵</div>
                    <div>
                      <p class="text-xs font-semibold text-blue-800">Please pay at the counter.</p>
                      <p class="text-[11px] text-blue-600">Awaiting Cash Payment</p>
                    </div>
                  </div>
                  <button onclick="window.app.markParticipantCash('${entry.name}')" class="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer">Confirm</button>
                </div>
              `}
            </div>
          `).join('')}
        </div>

        <div class="glass-card rounded-[2rem] p-5 border border-secondary/5 space-y-3">
          <h2 class="font-display font-bold text-base text-primary">Payment Progress</h2>
          <div class="grid grid-cols-3 gap-3 text-center text-xs">
            <div class="bg-background rounded-xl p-2.5 border border-secondary/5"><p class="text-secondary-light">Total</p><p class="font-display text-base font-bold text-primary">${grouped.length}</p></div>
            <div class="bg-green-50 rounded-xl p-2.5 border border-green-100"><p class="text-green-600">Paid</p><p class="font-display text-base font-bold text-green-700">${paidCount}</p></div>
            <div class="bg-orange-50 rounded-xl p-2.5 border border-orange-100"><p class="text-orange-600">Pending</p><p class="font-display text-base font-bold text-orange-700">${pendingCount}</p></div>
          </div>
          <div class="space-y-1.5">
            <div class="h-3 bg-background-dark rounded-full overflow-hidden">
              <div class="shared-progress-fill h-full rounded-full bg-gradient-to-r from-success to-success-light" style="width:${progress}%"></div>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-secondary-light">${progress}% Completed</span>
              <div class="flex gap-1.5">
                <span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">Paid</span>
                <span class="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold">Pending</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">Cash Collection</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-20 md:bottom-4 space-y-2">
          <button onclick="window.app.switchView('checkout')" class="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">Proceed to Individual Payments</button>
          <button onclick="window.app.switchView('catalog')" class="w-full bg-white border border-secondary/15 text-secondary hover:bg-background-dark font-semibold py-3.5 rounded-2xl transition-all cursor-pointer text-sm">Edit Shared Order</button>
        </div>
      </section>
    `;

    requestAnimationFrame(() => {
      const bar = container.querySelector('.shared-progress-fill');
      if (!bar) return;
      const target = bar.style.width;
      bar.style.width = '0%';
      bar.classList.add('shared-progress-fill--animated');
      requestAnimationFrame(() => { bar.style.width = target; });
    });
  },

  setSharedPaymentMethod(name, method) {
    sharedPaymentSelections[name] = method;
    if (sharedPaymentStatuses[name] === 'cash' && method === 'online') {
      sharedPaymentStatuses[name] = 'pending';
    }
    if (!sharedOnlinePaymentChannels[name]) {
      sharedOnlinePaymentChannels[name] = 'qr';
    }
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'review-shared-order' && container) {
      this.renderReviewSharedOrder(container);
    }
  },

  setSharedOnlinePaymentChannel(name, channel) {
    sharedOnlinePaymentChannels[name] = channel;
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'review-shared-order' && container) {
      this.renderReviewSharedOrder(container);
    }
  },

  markParticipantPaid(name) {
    const channel = sharedOnlinePaymentChannels[name] || 'qr';
    const channelLabel = {
      qr: 'QR',
      tng: "Touch 'n Go",
      duitnow: 'DuitNow'
    };
    sharedPaymentStatuses[name] = 'paid';
    if (window.app && typeof window.app.showFloatingAlert === 'function') {
      window.app.showFloatingAlert(`${name} payment received via ${channelLabel[channel] || 'Online Payment'}.`, 'success');
    }
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'review-shared-order' && container) {
      this.renderReviewSharedOrder(container);
    }
  },

  markParticipantCash(name) {
    sharedPaymentStatuses[name] = 'cash';
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'review-shared-order' && container) {
      this.renderReviewSharedOrder(container);
    }
  },

  trackOrderLookup(query) {
    const q = query.trim();
    if (!q) return;
    const order = store.state.orders.find(o => o.orderId.toLowerCase() === q.toLowerCase());
    const tracking = order ? store.state.delivery.find(d => d.orderId === order.orderId) : null;
    const meal = order ? store.state.meals.find(m => m.mealId === order.mealId) : null;
    const customer = order ? store.state.customers.find(c => c.customerId === order.customerId) : null;
    trackOrderResult = { query: q, order, tracking, meal, customer };
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'track-order' && container) {
      this.renderTrackOrder(container);
    }
  },

  // ─── 4. SELLER REGISTRATION ──────────────────────────────────────────────────
  
  renderApplyJob(container) {
    container.innerHTML = `
      <section class="relative bg-primary rounded-[2rem] overflow-hidden mb-12 shadow-premium text-white">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-transparent z-0"></div>
        <div class="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-accent/10 z-0"></div>
        <div class="max-w-2xl relative z-10 space-y-5 p-8 md:p-14">
          <span class="text-accent bg-accent/15 border border-accent/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Seller Programme</span>
          <h1 class="font-display text-3xl md:text-4xl lg:text-5xl text-white font-extrabold leading-tight">
            Become a Frozen Dumpling <span class="text-accent">Seller</span>
          </h1>
          <p class="text-white/70 text-sm md:text-base leading-relaxed">
            UTM students can join our reseller programme - sell premium halal frozen dumplings to your campus community and earn commission on every order. No upfront cost, no inventory to manage.
          </p>
        </div>
      </section>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Benefits sidebar -->
        <aside class="w-full lg:w-80 flex-shrink-0">
          <div class="glass-card rounded-[2rem] p-6 border border-secondary/5 space-y-5">
            <h3 class="font-display font-bold text-lg text-primary">Why Become a Seller?</h3>
            <div class="space-y-4">
              ${[
                { icon: '💰', color: 'bg-accent/10 text-accent', title: 'Earn Commission', desc: 'Get RM 1.50-RM 3.00 per pack sold, paid weekly to your bank account.' },
                { icon: '⏰', color: 'bg-success/10 text-success', title: 'Flexible Hours', desc: 'Sell around your class schedule - no fixed shifts required.' },
                { icon: '🚚', color: 'bg-primary/10 text-primary', title: 'We Handle Supply', desc: 'We pack and supply the dumplings - you just collect orders and payments.' },
                { icon: '🎓', color: 'bg-yellow-100 text-yellow-600', title: 'Student-Friendly', desc: 'Designed for UTM students. No experience needed, just a phone and network!' }
              ].map(b => `
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 ${b.color} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-lg">${b.icon}</div>
                  <div>
                    <h4 class="font-display font-semibold text-sm text-primary">${b.title}</h4>
                    <p class="text-xs text-secondary-light leading-relaxed">${b.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Info box -->
            <div class="bg-accent/5 border border-accent/15 rounded-2xl p-4 text-xs text-secondary-light leading-relaxed">
              <strong class="text-primary block mb-1">Settlement Info</strong>
              Commissions are calculated every Sunday and transferred to your registered bank account by Monday. You can view your settlement status in the Seller Portal.
            </div>
          </div>
        </aside>

        <!-- Registration Form -->
        <main class="flex-grow">
          <div class="glass-card rounded-[2rem] p-6 md:p-8 border border-secondary/5 space-y-6">
            <h2 class="font-display text-2xl font-bold text-primary border-b border-secondary/5 pb-4">Seller Registration Form</h2>

            <form id="applyJobForm" onsubmit="event.preventDefault(); window.app.submitApplication(new FormData(this))" class="space-y-4">

              <!-- Personal info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Full Name <span class="text-accent">*</span></label>
                  <input type="text" name="fullName" required placeholder="e.g. Nurul Ain binti Ahmad" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Matric / IC Number <span class="text-accent">*</span></label>
                  <input type="text" name="studentId" required placeholder="e.g. A21CS1234" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>

              <!-- UTM info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Faculty / Department <span class="text-accent">*</span></label>
                  <input type="text" name="faculty" required placeholder="e.g. Faculty of Computing" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Year of Study <span class="text-accent">*</span></label>
                  <select name="year" required class="form-input-premium text-sm py-2.5">
                    <option value="">Select year...</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="postgrad">Postgraduate</option>
                  </select>
                </div>
              </div>

              <!-- Contact -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Email Address <span class="text-accent">*</span></label>
                  <input type="email" name="email" required placeholder="e.g. nurul@graduate.utm.my" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">WhatsApp Number <span class="text-accent">*</span></label>
                  <input type="tel" name="phone" required placeholder="e.g. 012-345 6789" class="form-input-premium text-sm py-2.5" />
                </div>
              </div>

              <!-- Selling details -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Intended Selling Location <span class="text-accent">*</span></label>
                  <input type="text" name="location" required placeholder="e.g. KTF Block A, Dewan Makan KTF" class="form-input-premium text-sm py-2.5" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-secondary-light block">Expected Weekly Sales (packs) <span class="text-accent">*</span></label>
                  <select name="weeklyVolume" required class="form-input-premium text-sm py-2.5">
                    <option value="">Select range...</option>
                    <option value="1-10">1-10 packs</option>
                    <option value="11-30">11-30 packs</option>
                    <option value="31-50">31-50 packs</option>
                    <option value="50+">50+ packs</option>
                  </select>
                </div>
              </div>

              <!-- Bank account for settlement -->
              <div class="pt-4 border-t border-secondary/5">
                <h3 class="font-display font-semibold text-sm text-primary mb-3">Settlement / Payment Details</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-secondary-light block">Bank Name <span class="text-accent">*</span></label>
                    <select name="bank" required class="form-input-premium text-sm py-2.5">
                      <option value="">Select bank...</option>
                      <option value="Maybank">Maybank</option>
                      <option value="CIMB">CIMB Bank</option>
                      <option value="RHB">RHB Bank</option>
                      <option value="Public Bank">Public Bank</option>
                      <option value="Bank Islam">Bank Islam</option>
                      <option value="Bank Rakyat">Bank Rakyat</option>
                      <option value="BSN">BSN</option>
                      <option value="AmBank">AmBank</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-secondary-light block">Bank Account Number <span class="text-accent">*</span></label>
                    <input type="text" name="bankAccount" required placeholder="e.g. 1234567890" class="form-input-premium text-sm py-2.5" />
                  </div>
                </div>
              </div>

              <!-- Motivation -->
              <div class="space-y-1">
                <label class="text-xs font-semibold text-secondary-light block">Why do you want to become a seller? <span class="text-accent">*</span></label>
                <textarea name="motivation" rows="3" required placeholder="Tell us about your motivation and how you plan to sell dumplings to your campus community..." class="form-input-premium text-sm py-2.5"></textarea>
              </div>

              <!-- Agreement -->
              <div class="pt-2">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agree" required class="accent-accent mt-0.5" />
                  <span class="text-xs text-secondary-light leading-relaxed">I confirm that I am a registered UTM student and I agree to the Hot Meal Ba seller programme terms and conditions. I understand that settlement will be made weekly to the bank account provided.</span>
                </label>
              </div>

              <div class="pt-6 border-t border-secondary/5 flex justify-end gap-3">
                <button type="button" onclick="window.app.switchView('home')" class="px-6 py-3 border border-secondary/15 rounded-2xl text-secondary hover:bg-background-dark font-medium text-sm transition-all cursor-pointer">Cancel</button>
                <button type="submit" class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-accent-glow hover:shadow-none transition-all cursor-pointer text-sm">Submit Application</button>
              </div>
            </form>
          </div>
        </main>
      </div>
    `;
  },

  submitApplication(formData) {
    const application = {
      fullName: formData.get('fullName'),
      studentId: formData.get('studentId'),
      faculty: formData.get('faculty'),
      year: formData.get('year'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      weeklyVolume: formData.get('weeklyVolume'),
      bank: formData.get('bank'),
      bankAccount: formData.get('bankAccount'),
      motivation: formData.get('motivation'),
      submittedAt: new Date().toISOString()
    };

    const apps = JSON.parse(localStorage.getItem('hmb_seller_applications') || '[]');
    apps.push(application);
    localStorage.setItem('hmb_seller_applications', JSON.stringify(apps));

    const form = document.getElementById('applyJobForm');
    if (form) {
      const wrapper = form.closest('section') || form.parentElement;
      wrapper.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center py-16 px-6 animate-slide-up">
          <div class="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <svg class="w-10 h-10 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 class="font-display font-bold text-2xl text-primary mb-2">Application Submitted!</h2>
          <p class="text-secondary-light text-sm max-w-xs mb-2">
            Thank you, <span class="font-semibold text-charcoal">${application.fullName}</span>!
          </p>
          <p class="text-secondary-light text-sm max-w-xs mb-8">
            We will review your application and contact you at <span class="font-semibold text-charcoal">${application.email}</span> or via WhatsApp within <strong>2–3 working days</strong>.
          </p>
          <button onclick="window.app.switchView('home')" class="px-8 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-2xl shadow-accent-glow hover:shadow-none transition-all text-sm cursor-pointer">
            Back to Home
          </button>
        </div>
      `;
    }
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.setCatalogCategory = customerViews.setCatalogCategory.bind(customerViews);
window.app.catalogSort = customerViews.catalogSort.bind(customerViews);
window.app.catalogSearch = customerViews.catalogSearch.bind(customerViews);
window.app.catalogPage = customerViews.catalogPage.bind(customerViews);
window.app.submitCheckout = customerViews.submitCheckout.bind(customerViews);
window.app.submitApplication = customerViews.submitApplication.bind(customerViews);
window.app.trackOrderLookup = customerViews.trackOrderLookup.bind(customerViews);
window.app.setSharedPaymentMethod = customerViews.setSharedPaymentMethod.bind(customerViews);
window.app.setSharedOnlinePaymentChannel = customerViews.setSharedOnlinePaymentChannel.bind(customerViews);
window.app.markParticipantPaid = customerViews.markParticipantPaid.bind(customerViews);
window.app.markParticipantCash = customerViews.markParticipantCash.bind(customerViews);

// Table session helpers
window.app.selectCartTable = function(tableNo) {
  window._chosenTable = tableNo;
};

window.app.confirmJoinTable = function() {
  const tableNo = window._chosenTable;
  const nameInput = document.getElementById('cart-session-name');
  const myName = nameInput ? nameInput.value.trim() : '';
  if (!tableNo) {
    window.app.showFloatingAlert('Please select a table first.', 'info');
    return;
  }
  if (!myName) {
    window.app.showFloatingAlert('Please enter your name.', 'info');
    return;
  }
  store.joinTable({ tableNo, myName });
  window._chosenTable = null;
  customerViews.renderCartDrawer();
};

window.app.leaveTable = function() {
  store.leaveTable();
  customerViews.renderCartDrawer();
};

// Simulated members already seated at each table
window._tableMembers = {
  T01: [],
  T02: [{ name: 'Alex', av: 'AL', tone: 'bg-blue-400' }],
  T03: [{ name: 'John', av: 'JN', tone: 'bg-indigo-500' }, { name: 'Emily', av: 'EM', tone: 'bg-amber-500' }],
  T04: [],
  T05: [{ name: 'Alex', av: 'AL', tone: 'bg-blue-400' }, { name: 'John', av: 'JN', tone: 'bg-indigo-500' }, { name: 'Emily', av: 'EM', tone: 'bg-amber-500' }],
  T06: [{ name: 'Emily', av: 'EM', tone: 'bg-amber-500' }],
  T07: [],
  T08: [{ name: 'Alex', av: 'AL', tone: 'bg-blue-400' }],
};

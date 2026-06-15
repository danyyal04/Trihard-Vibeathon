// admin.js - View controller for Admin screens

import { store } from '../store.js';
import { dataLoader } from '../data-loader.js';
import { renderOrderTable, renderCustomerTable, renderPagination } from '../components/table.js';
import { renderRevenueChart } from '../components/charts.js';

// Local admin states
let ordersFilters = {
  search: '',
  status: 'All',
  sortBy: 'date-desc',
  dateFilter: 'All',
  customerFilter: 'All',
  sellerFilter: 'All',
  page: 1,
  limit: 12
};

let customersFilters = {
  search: '',
  page: 1,
  limit: 12
};

let activeDetailsOrderId = null;

export const adminViews = {
  // Render Dashboard KPI summaries, Canvas Charts & Top meals lists
  renderDashboard(container) {
    const metrics = dataLoader.getAdminMetrics();
    
    container.innerHTML = `
      <div class="space-y-8 animate-fade-in">
        <!-- Top Metrics row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- KPI 1 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Total Revenue</span>
              <span class="text-2xl font-extrabold text-primary font-display">RM ${metrics.kpis.totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <!-- KPI 2 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Total Orders</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.totalOrders}</span>
            </div>
          </div>

          <!-- KPI 3 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Active Orders</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.activeOrders}</span>
            </div>
          </div>

          <!-- KPI 4 -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium flex items-center gap-4">
            <div class="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            </div>
            <div>
              <span class="text-xs text-secondary-light block uppercase font-bold tracking-wider">Average Rating</span>
              <span class="text-2xl font-extrabold text-primary font-display">${metrics.kpis.avgRating.toFixed(1)} / 5.0</span>
            </div>
          </div>

        </div>

        <!-- Sales Analytics Chart and Top popular items panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Chart pane -->
          <div class="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium flex flex-col justify-between">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-display font-bold text-lg text-primary">Revenue Timeline (7 Days)</h3>
              <span class="text-xs text-secondary-light">Sales volume aggregate</span>
            </div>
            <!-- Canvas target -->
            <div class="relative w-full h-64 md:h-80">
              <canvas id="revenueChartCanvas" class="w-full h-full"></canvas>
            </div>
          </div>

          <!-- Popular items ledger -->
          <div class="bg-white rounded-[2rem] p-6 border border-secondary/5 shadow-premium">
            <h3 class="font-display font-bold text-lg text-primary border-b border-secondary/5 pb-4 mb-4">Top 5 Best-Selling Dumplings</h3>
            <div class="space-y-4">
              ${metrics.popularMeals.map((meal, idx) => `
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full bg-background-dark text-primary font-bold text-xs flex items-center justify-center">${idx + 1}</span>
                    <div>
                      <h4 class="font-display font-semibold text-sm text-primary line-clamp-1">${meal.mealName}</h4>
                      <span class="text-[10px] text-secondary-light">${meal.category}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="text-xs font-bold text-primary block">${meal.quantity} orders</span>
                    <span class="text-[10px] text-secondary-light">RM ${(meal.price * meal.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      </div>
    `;

    // Trigger Canvas Drawing loop asynchronously
    setTimeout(() => {
      renderRevenueChart('revenueChartCanvas', metrics.revenueChart);
    }, 100);
  },

  // Render order registry management interface
  renderOrders(container) {
    const results = dataLoader.queryOrders(ordersFilters);

    // Compute Stats from all orders (not filtered)
    const allOrders = store.state.orders;
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(o => o.status === 'received').length;
    const preparingOrders = allOrders.filter(o => o.status === 'preparing').length;
    const readyOrders = allOrders.filter(o => o.status === 'cooking' || o.status === 'out_for_delivery').length;
    const completedOrders = allOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = allOrders.filter(o => o.status === 'cancelled').length;

    // Retrieve unique list of customers and sellers for filters
    const uniqueCustomers = store.state.customers;
    const uniqueSellers = [...new Set(store.state.delivery.map(d => d.driverName).filter(Boolean))].sort();

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        <!-- KPI Stats Cards Row -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <!-- Card 1: Total Orders -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Total</span>
              <div class="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-primary font-display block">${totalOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">All order records</span>
            </div>
          </div>

          <!-- Card 2: Pending Orders -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Pending</span>
              <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-blue-600 font-display block">${pendingOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">Awaiting confirmation</span>
            </div>
          </div>

          <!-- Card 3: Preparing -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Preparing</span>
              <div class="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-amber-600 font-display block">${preparingOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">Packing dumplings</span>
            </div>
          </div>

          <!-- Card 4: Ready -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Ready</span>
              <div class="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296a3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-purple-600 font-display block">${readyOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">Ready or en route</span>
            </div>
          </div>

          <!-- Card 5: Completed -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Completed</span>
              <div class="w-8 h-8 bg-success/10 rounded-xl flex items-center justify-center text-success-dark group-hover:bg-success group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-success-dark font-display block">${completedOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">Delivered & enjoyed</span>
            </div>
          </div>

          <!-- Card 6: Cancelled -->
          <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col justify-between hover:-translate-y-1 hover:shadow-premium-hover transition-all duration-300 group">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-secondary-light block uppercase font-bold tracking-wider">Cancelled</span>
              <div class="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-2xl font-extrabold text-rose-600 font-display block">${cancelledOrders}</span>
              <span class="text-[9px] text-secondary-light font-medium block mt-0.5">Cancelled orders</span>
            </div>
          </div>
        </div>

        <!-- Filter Toolbar & Table Container -->
        <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
            <h2 class="font-display text-2xl font-bold text-primary">Order Registry & Settlement</h2>
          </div>

          <!-- Advanced Filters Panel -->
          <div class="bg-background-dark/20 border border-secondary/5 rounded-3xl p-4 md:p-6 space-y-4 shadow-sm">
            <!-- Search & Actions Row -->
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <!-- Search bar -->
              <div class="relative flex-grow max-w-lg">
                <input 
                  type="text" 
                  placeholder="Search Order ID, Customer Name, Phone, Seller, Dumpling..."
                  value="${ordersFilters.search}"
                  oninput="window.app.adminOrdersSearch(this.value)"
                  class="form-input-premium pl-10 pr-4 py-2 text-xs"
                />
                <svg class="w-4 h-4 text-secondary/40 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>

              <!-- Quick Action Buttons -->
              <div class="flex flex-wrap items-center gap-2 lg:justify-end">
                <button 
                  onclick="window.app.adminResetFilters()"
                  class="bg-white hover:bg-background-dark text-secondary border border-secondary/15 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
                  title="Reset All Filters"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                  Reset Filters
                </button>
                <button 
                  onclick="window.app.adminExportCSV()"
                  class="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-accent-glow hover:shadow-none active:scale-95 cursor-pointer"
                  title="Export List as CSV"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                  Export CSV
                </button>
                <button 
                  onclick="window.app.adminRefresh()"
                  class="bg-white hover:bg-background-dark text-secondary border border-secondary/15 p-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
                  title="Refresh Order Data"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                </button>
              </div>
            </div>

            <!-- Dropdowns Selector Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <!-- Status Selector -->
              <div class="flex flex-col gap-1">
                <label class="text-[9px] text-secondary-light uppercase tracking-wider font-bold">Status Filter</label>
                <select 
                  onchange="window.app.adminOrdersStatus(this.value)"
                  class="bg-white border border-secondary/10 rounded-xl text-xs px-2.5 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="All" ${ordersFilters.status === 'All' ? 'selected' : ''}>All Statuses</option>
                  <option value="Pending" ${ordersFilters.status === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Preparing" ${ordersFilters.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                  <option value="Ready" ${ordersFilters.status === 'Ready' ? 'selected' : ''}>Ready (Quality Check)</option>
                  <option value="out_for_delivery" ${ordersFilters.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                  <option value="Delivered" ${ordersFilters.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  <option value="Cancelled" ${ordersFilters.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
              </div>

              <!-- Date Range Selector -->
              <div class="flex flex-col gap-1">
                <label class="text-[9px] text-secondary-light uppercase tracking-wider font-bold">Date Filter</label>
                <select 
                  onchange="window.app.adminOrdersDate(this.value)"
                  class="bg-white border border-secondary/10 rounded-xl text-xs px-2.5 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="All" ${ordersFilters.dateFilter === 'All' ? 'selected' : ''}>All Time</option>
                  <option value="Today" ${ordersFilters.dateFilter === 'Today' ? 'selected' : ''}>Today</option>
                  <option value="Yesterday" ${ordersFilters.dateFilter === 'Yesterday' ? 'selected' : ''}>Yesterday</option>
                  <option value="7days" ${ordersFilters.dateFilter === '7days' ? 'selected' : ''}>Last 7 Days</option>
                  <option value="30days" ${ordersFilters.dateFilter === '30days' ? 'selected' : ''}>Last 30 Days</option>
                </select>
              </div>

              <!-- Customer Selector -->
              <div class="flex flex-col gap-1">
                <label class="text-[9px] text-secondary-light uppercase tracking-wider font-bold">Customer Filter</label>
                <select 
                  onchange="window.app.adminOrdersCustomer(this.value)"
                  class="bg-white border border-secondary/10 rounded-xl text-xs px-2.5 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer font-medium max-w-full truncate"
                >
                  <option value="All">All Customers</option>
                  ${uniqueCustomers.map(c => `<option value="${c.customerId}" ${ordersFilters.customerFilter === c.customerId ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
              </div>

              <!-- Seller Selector -->
              <div class="flex flex-col gap-1">
                <label class="text-[9px] text-secondary-light uppercase tracking-wider font-bold">Seller Filter</label>
                <select 
                  onchange="window.app.adminOrdersSeller(this.value)"
                  class="bg-white border border-secondary/10 rounded-xl text-xs px-2.5 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer font-medium max-w-full truncate"
                >
                  <option value="All">All Sellers</option>
                  ${uniqueSellers.map(s => `<option value="${s}" ${ordersFilters.sellerFilter === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </div>

              <!-- Sort Option Selector -->
              <div class="flex flex-col gap-1">
                <label class="text-[9px] text-secondary-light uppercase tracking-wider font-bold">Sort By</label>
                <select 
                  onchange="window.app.adminOrdersSort(this.value)"
                  class="bg-white border border-secondary/10 rounded-xl text-xs px-2.5 py-2 text-secondary focus:outline-none focus:border-accent cursor-pointer font-medium"
                >
                  <option value="date-desc" ${ordersFilters.sortBy === 'date-desc' ? 'selected' : ''}>Newest First</option>
                  <option value="date-asc" ${ordersFilters.sortBy === 'date-asc' ? 'selected' : ''}>Oldest First</option>
                  <option value="amount-desc" ${ordersFilters.sortBy === 'amount-desc' ? 'selected' : ''}>Highest Price</option>
                  <option value="amount-asc" ${ordersFilters.sortBy === 'amount-asc' ? 'selected' : ''}>Lowest Price</option>
                  <option value="id-asc" ${ordersFilters.sortBy === 'id-asc' ? 'selected' : ''}>Order ID (Asc)</option>
                  <option value="id-desc" ${ordersFilters.sortBy === 'id-desc' ? 'selected' : ''}>Order ID (Desc)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Render orders table -->
          ${renderOrderTable(results.items)}
          ${renderPagination(results.page, results.totalPages, 'adminOrdersPage')}
        </div>
      </div>

      <!-- Details Side Drawer Overlay -->
      <div id="order-drawer-backdrop" class="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-50 hidden transition-opacity duration-300 opacity-0" onclick="window.app.closeOrderDetails()">
        <div id="order-drawer-panel" class="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 flex flex-col justify-between" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="h-20 border-b border-secondary/5 px-6 flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-primary" id="drawer-order-id-label">Order Details</h3>
            <button onclick="window.app.closeOrderDetails()" class="text-secondary/40 hover:text-primary p-2 rounded-full hover:bg-background transition-colors cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Scrollable content -->
          <div id="drawer-content-inner" class="flex-grow p-6 space-y-6 overflow-y-auto bg-background/20">
            <!-- Injected dynamically -->
          </div>
        </div>
      </div>
    `;
  },

  // Search input change callback
  adminOrdersSearch(query) {
    ordersFilters.search = query;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Status select change callback
  adminOrdersStatus(status) {
    ordersFilters.status = status;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Page index trigger callback
  adminOrdersPage(page) {
    ordersFilters.page = page;
    this.refreshOrders();
  },

  // Date range select change callback
  adminOrdersDate(date) {
    ordersFilters.dateFilter = date;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Customer dropdown change callback
  adminOrdersCustomer(customerId) {
    ordersFilters.customerFilter = customerId;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Seller dropdown change callback
  adminOrdersSeller(sellerName) {
    ordersFilters.sellerFilter = sellerName;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Sorting option change callback
  adminOrdersSort(sortBy) {
    ordersFilters.sortBy = sortBy;
    ordersFilters.page = 1;
    this.refreshOrders();
  },

  // Reset Filters to default values
  adminResetFilters() {
    ordersFilters = {
      search: '',
      status: 'All',
      sortBy: 'date-desc',
      dateFilter: 'All',
      customerFilter: 'All',
      sellerFilter: 'All',
      page: 1,
      limit: 12
    };
    this.refreshOrders();
    window.app.showFloatingAlert("Filters reset to defaults.", "info");
  },

  // Export filtered orders as CSV file download
  adminExportCSV() {
    const results = dataLoader.queryOrders({ ...ordersFilters, page: 1, limit: 100000 });
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Order Date', 'Items', 'Total (RM)', 'Status', 'Seller'];
    const rows = results.items.map(o => [
      o.orderId,
      o.customerName,
      o.customerPhone,
      o.orderDate,
      `"${o.mealName.replace(/"/g, '""')}"`,
      o.amount.toFixed(2),
      o.status,
      o.driverName
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.app.showFloatingAlert("CSV Report exported successfully.", "success");
  },

  // Quick refresh callback
  adminRefresh() {
    this.refreshOrders();
    window.app.showFloatingAlert("Order data refreshed.", "success");
  },

  // Update order status callback
  adminUpdateStatus(orderId, status) {
    store.updateOrderStatus(orderId, status);
    this.refreshOrders();
    // Refresh details drawer content if currently viewing the modified order
    if (activeDetailsOrderId === orderId) {
      this.refreshDetailsDrawer(orderId);
    }
  },

  // Reassign courier seller
  adminReassignSeller(orderId, sellerName) {
    const driver = store.state.delivery.find(d => d.driverName === sellerName);
    const phone = driver ? driver.driverPhone : '+60 7-555 0000';
    store.assignDriver(orderId, sellerName, phone);
    this.refreshOrders();
    if (activeDetailsOrderId === orderId) {
      this.refreshDetailsDrawer(orderId);
    }
    window.app.showFloatingAlert(`Courier reassigned to ${sellerName}`, 'success');
  },

  // Refresh view wrapper
  refreshOrders() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'admin-orders' && container) {
      this.renderOrders(container);
    }
  },

  // Open Sliding details drawer
  openOrderDetails(orderId) {
    activeDetailsOrderId = orderId;
    const backdrop = document.getElementById('order-drawer-backdrop');
    const panel = document.getElementById('order-drawer-panel');
    const label = document.getElementById('drawer-order-id-label');
    const inner = document.getElementById('drawer-content-inner');

    if (backdrop && panel && label && inner) {
      label.textContent = `Order Details #${orderId}`;
      inner.innerHTML = this.renderDetailsDrawerContent(orderId);
      
      backdrop.classList.remove('hidden');
      setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
      }, 10);
    }
  },

  // Close sliding details drawer
  closeOrderDetails() {
    activeDetailsOrderId = null;
    const backdrop = document.getElementById('order-drawer-backdrop');
    const panel = document.getElementById('order-drawer-panel');

    if (backdrop && panel) {
      backdrop.classList.add('opacity-0');
      panel.classList.remove('translate-x-0');
      panel.classList.add('translate-x-full');
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 300);
    }
  },

  // Reload drawer contents reactively
  refreshDetailsDrawer(orderId) {
    const inner = document.getElementById('drawer-content-inner');
    if (inner) {
      inner.innerHTML = this.renderDetailsDrawerContent(orderId);
    }
  },

  // Render vertical timeline progress stepper inside drawer
  renderVerticalTimeline(order) {
    const steps = [
      { key: 'received', label: 'Order Received', desc: 'Customer placed order' },
      { key: 'verified', label: 'Payment Verified', desc: 'Transaction proof confirmed' },
      { key: 'preparing', label: 'Preparing Pack', desc: 'Packing frozen dumplings' },
      { key: 'cooking', label: 'Quality Check (Ready)', desc: 'Final check before dispatch' },
      { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier on the way' },
      { key: 'delivered', label: 'Delivered', desc: 'Order received by UTM customer' }
    ];

    const statusIndices = {
      'received': 0,
      'preparing': 2,
      'cooking': 3,
      'out_for_delivery': 4,
      'delivered': 5,
      'cancelled': -1
    };

    const isCancelled = order.status === 'cancelled';
    
    // Custom indices stepping logic
    let currentIndex = statusIndices[order.status] !== undefined ? statusIndices[order.status] : 0;

    let html = '<div class="relative pl-6 space-y-6 border-l-2 border-secondary/10 ml-3">';
    
    steps.forEach((step, idx) => {
      let isCompleted = false;
      let isActive = false;
      
      if (!isCancelled) {
        if (order.status === 'received') {
          isActive = idx === 0;
        } else if (order.status === 'preparing') {
          isCompleted = idx < 2;
          isActive = idx === 2;
        } else if (order.status === 'cooking') {
          isCompleted = idx < 3;
          isActive = idx === 3;
        } else if (order.status === 'out_for_delivery') {
          isCompleted = idx < 4;
          isActive = idx === 4;
        } else if (order.status === 'delivered') {
          isCompleted = idx <= 5;
        }
      }

      let circleColor = 'border-secondary/20 bg-white text-secondary/40';
      let labelColor = 'text-secondary-light font-semibold';
      let ringClass = '';

      if (isCompleted) {
        circleColor = 'bg-success border-success text-white';
        labelColor = 'text-primary font-bold';
      } else if (isActive) {
        circleColor = 'bg-accent border-accent text-white shadow-accent-glow';
        labelColor = 'text-accent font-extrabold';
        ringClass = 'map-pulse';
      }

      // Step selection mapping triggers status mutation
      const statusMap = {
        0: 'received',
        1: 'received',
        2: 'preparing',
        3: 'cooking',
        4: 'out_for_delivery',
        5: 'delivered'
      };
      const targetStatus = statusMap[idx];

      html += `
        <div 
          onclick="window.app.adminUpdateStatus('${order.orderId}', '${targetStatus}')"
          class="relative flex items-start gap-4 cursor-pointer group select-none hover:translate-x-1 transition-transform"
        >
          <!-- Step circle indicator -->
          <div class="absolute -left-[35px] w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold z-10 transition-colors duration-300 ${circleColor} ${ringClass}">
            ${isCompleted ? '✓' : idx + 1}
          </div>
          
          <div>
            <span class="text-xs ${labelColor} transition-colors group-hover:text-accent font-sans">${step.label}</span>
            <span class="text-[9px] text-secondary-light block mt-0.5">${step.desc}</span>
          </div>
        </div>
      `;
    });

    if (isCancelled) {
      html += `
        <div class="relative flex items-start gap-4">
          <div class="absolute -left-[35px] w-6 h-6 rounded-full bg-rose-500 border-2 border-rose-500 text-white flex items-center justify-center text-[10px] font-bold z-10">
            ✕
          </div>
          <div>
            <span class="text-xs text-rose-500 font-bold font-sans">Order Cancelled</span>
            <span class="text-[9px] text-secondary-light block mt-0.5">Admin has cancelled this order.</span>
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  },

  // Render mock transaction slip
  renderPaymentReceipt(order, paymentMethod) {
    const txnId = `TXN_${order.orderId.toUpperCase()}_${new Date(order.orderDate).getTime().toString().slice(-6)}`;
    const dateFormatted = new Date(order.orderDate).toLocaleDateString('en-MY', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const timeFormatted = new Date(order.orderDate).toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    let paymentLabel = '';
    if (paymentMethod === 'online') paymentLabel = 'Online Bank Transfer';
    else if (paymentMethod === 'ewallet') paymentLabel = 'TnG / DuitNow E-Wallet';
    else paymentLabel = 'Cash on Delivery';

    return `
      <div class="bg-gradient-to-br from-white to-background-dark/20 rounded-3xl p-5 border border-secondary/10 shadow-premium relative overflow-hidden font-mono text-[11px] text-charcoal-light space-y-3">
        <!-- Decorative circles -->
        <div class="absolute -top-3 left-0 right-0 flex justify-around opacity-5">
          ${Array(16).fill(0).map(() => `<div class="w-3.5 h-3.5 rounded-full bg-charcoal"></div>`).join('')}
        </div>

        <div class="flex items-center justify-between font-sans pb-2 border-b border-dashed border-secondary/20 pt-1.5">
          <span class="text-[10px] font-bold text-secondary uppercase tracking-widest">Transaction Slip</span>
          <span class="px-2 py-0.5 text-[9px] font-bold bg-success/10 text-success border border-success/20 rounded-full">✓ Verified</span>
        </div>

        <div class="space-y-1.5 pt-1">
          <div class="flex justify-between">
            <span>RECEIPT ID:</span>
            <span class="font-bold text-primary">${txnId}</span>
          </div>
          <div class="flex justify-between">
            <span>METHOD:</span>
            <span class="font-bold text-primary">${paymentLabel}</span>
          </div>
          <div class="flex justify-between">
            <span>DATE:</span>
            <span class="font-bold text-primary">${dateFormatted}</span>
          </div>
          <div class="flex justify-between">
            <span>TIME:</span>
            <span class="font-bold text-primary">${timeFormatted}</span>
          </div>
          <div class="flex justify-between">
            <span>DESTINATION:</span>
            <span class="font-bold text-primary">Hot Meal Ba (UTM)</span>
          </div>
        </div>

        <div class="border-t border-dashed border-secondary/20 pt-2 flex justify-between font-sans text-xs">
          <span class="font-bold text-primary">Amount Paid:</span>
          <span class="font-extrabold text-success font-display text-sm">RM ${order.amount.toFixed(2)}</span>
        </div>
      </div>
    `;
  },

  // Generates side drawer content layout
  renderDetailsDrawerContent(orderId) {
    const order = store.state.orders.find(o => o.orderId === orderId);
    if (!order) return '';

    const customer = store.state.customers.find(c => c.customerId === order.customerId);
    const meal = store.state.meals.find(m => m.mealId === order.mealId);
    const tracking = store.state.delivery.find(d => d.orderId === order.orderId);
    
    const details = tracking ? tracking.details : null;
    
    const customerName = details && details.name ? details.name : (customer ? customer.name : 'Guest User');
    const customerPhone = details && details.phone ? details.phone : (customer ? customer.phone : '--');
    const customerAddress = details && details.address ? details.address : (customer ? customer.location : 'No Address Provided');
    const customerEmail = customer ? customer.email : '--';
    const customerMatric = details && details.matric ? details.matric : '--';
    const customerFulfil = details && details.fulfil ? details.fulfil : 'Delivery';
    const paymentMethod = details && details.payment ? details.payment : 'online';
    const mealName = meal ? meal.mealName : 'Deleted Dumpling';
    const mealCategory = meal ? meal.category : 'N/A';
    const mealPrice = meal ? meal.price : 0;
    const estTime = tracking ? tracking.estimatedTime : '--:--';
    const driverName = tracking ? tracking.driverName : 'Unassigned';
    const driverPhone = tracking ? tracking.driverPhone : '--';

    const settlementKey = `hmb_settled_${order.orderId}`;
    const isSettled = typeof window !== 'undefined' && localStorage.getItem(settlementKey) === 'true';

    // Settlement calculations
    const subtotal = order.amount;
    const platformFee = subtotal * 0.10;
    const sellerEarnings = subtotal * 0.90;

    const timelineHtml = this.renderVerticalTimeline(order);
    const receiptHtml = this.renderPaymentReceipt(order, paymentMethod);

    const uniqueSellers = [...new Set(store.state.delivery.map(d => d.driverName).filter(Boolean))].sort();

    return `
      <!-- Customer Information Card -->
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium space-y-3">
        <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light">Customer Profile</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between"><span class="text-secondary-light">Name:</span><span class="font-bold text-primary font-display">${customerName}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Phone:</span><span class="font-semibold text-primary">${customerPhone}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Email:</span><span class="font-medium text-primary">${customerEmail}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Matric No:</span><span class="font-semibold text-primary">${customerMatric}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Delivery Option:</span><span class="font-bold text-accent uppercase text-[10px]">${customerFulfil}</span></div>
          <div class="pt-2 border-t border-secondary/5">
            <span class="text-secondary-light block mb-1">Delivery Address:</span>
            <span class="font-medium text-charcoal block bg-background/30 p-2.5 rounded-xl border border-secondary/5">${customerAddress}</span>
          </div>
        </div>
      </div>

      <!-- Order Details Card -->
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium space-y-3">
        <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light">Order Items</h4>
        <div class="space-y-3">
          <div class="flex justify-between items-start gap-4">
            <div>
              <span class="font-semibold text-primary font-display block text-sm">${mealName}</span>
              <span class="text-[10px] text-secondary-light bg-background px-2.5 py-0.5 rounded-full inline-block mt-1">${mealCategory}</span>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="font-bold text-primary block text-sm">RM ${mealPrice.toFixed(2)}</span>
              <span class="text-[10px] text-secondary-light block mt-0.5">Qty: ${order.quantity}</span>
            </div>
          </div>
          <div class="border-t border-secondary/5 pt-2 flex justify-between text-xs font-bold text-primary">
            <span>Total:</span>
            <span>RM ${order.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Payment Proof Card -->
      <div class="space-y-2">
        <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light pl-1">Payment Slip</h4>
        ${receiptHtml}
      </div>

      <!-- Seller Assignment -->
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium space-y-4">
        <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light">Assigned Courier</h4>
        <div class="flex items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold text-primary block">${driverName}</span>
            <span class="text-[10px] text-secondary-light block mt-0.5">${driverPhone}</span>
          </div>
          
          <select 
            onchange="window.app.adminReassignSeller('${order.orderId}', this.value)"
            class="bg-background border border-secondary/15 rounded-xl text-xs px-2.5 py-2 font-semibold text-secondary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="" disabled ${!driverName ? 'selected' : ''}>Choose Courier</option>
            ${uniqueSellers.map(s => `<option value="${s}" ${driverName === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Timeline Component -->
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light">Order Flow Timeline</h4>
          <span class="text-[10px] text-secondary-light font-medium italic">Click steps to change status</span>
        </div>
        ${timelineHtml}
      </div>

      <!-- Settlement Earnings Card -->
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium space-y-3">
        <h4 class="font-display font-bold text-xs uppercase tracking-wider text-secondary-light">Settlement & Payout</h4>
        <div class="space-y-2.5 text-xs">
          <div class="flex justify-between"><span class="text-secondary-light">Total Subtotal:</span><span class="font-bold text-primary">RM ${subtotal.toFixed(2)}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Platform Fee (10%):</span><span class="font-semibold text-rose-600">- RM ${platformFee.toFixed(2)}</span></div>
          <div class="flex justify-between"><span class="text-secondary-light">Seller Earnings (90%):</span><span class="font-bold text-success">RM ${sellerEarnings.toFixed(2)}</span></div>
          <div class="flex justify-between items-center pt-2 border-t border-secondary/5">
            <span class="text-secondary-light">Payout Status:</span>
            ${isSettled
              ? `<span class="px-2.5 py-0.5 text-[10px] font-bold bg-success/10 text-success border border-success/20 rounded-full">✓ Paid & Settled</span>`
              : `<button onclick="window.app.adminMarkSettled('${order.orderId}')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-accent text-white shadow-accent-glow hover:shadow-none transition-all cursor-pointer active:scale-95">Mark as Settled</button>`
            }
          </div>
        </div>
      </div>
    `;
  },

  // Render Customer Directory View
  renderCustomers(container) {
    const results = dataLoader.queryCustomers(customersFilters);

    container.innerHTML = `
      <div class="bg-white rounded-[2rem] p-6 md:p-8 border border-secondary/5 shadow-premium space-y-6 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary/5 pb-4">
          <h2 class="font-display text-2xl font-bold text-primary">Customer Profiles</h2>
          
          <!-- Search input -->
          <div class="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search customers..."
              value="${customersFilters.search}"
              oninput="window.app.adminCustomersSearch(this.value)"
              class="w-full pl-9 pr-4 py-2 bg-background border border-secondary/10 rounded-xl focus:outline-none focus:border-accent text-xs"
            />
            <svg class="w-3.5 h-3.5 text-secondary/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <!-- Render customers table -->
        ${renderCustomerTable(results.items)}
        ${renderPagination(results.page, results.totalPages, 'adminCustomersPage')}
      </div>
    `;
  },

  // Search input change callback
  adminCustomersSearch(query) {
    customersFilters.search = query;
    customersFilters.page = 1;
    this.refreshCustomers();
  },

  // Page selection change callback
  adminCustomersPage(page) {
    customersFilters.page = page;
    this.refreshCustomers();
  },

  refreshCustomers() {
    const container = document.getElementById('view-container');
    if (store.state.activeView === 'admin-customers' && container) {
      this.renderCustomers(container);
    }
  },

  adminMarkSettled(orderId) {
    localStorage.setItem(`hmb_settled_${orderId}`, 'true');
    this.refreshOrders();
    if (activeDetailsOrderId === orderId) {
      this.refreshDetailsDrawer(orderId);
    }
    window.app.showFloatingAlert(`Order #${orderId} marked as settled.`, 'success');
  }
};

// Bind to window.app for click triggers
window.app = window.app || {};
window.app.adminOrdersSearch = adminViews.adminOrdersSearch.bind(adminViews);
window.app.adminOrdersStatus = adminViews.adminOrdersStatus.bind(adminViews);
window.app.adminOrdersPage = adminViews.adminOrdersPage.bind(adminViews);
window.app.adminUpdateStatus = adminViews.adminUpdateStatus.bind(adminViews);
window.app.adminCustomersSearch = adminViews.adminCustomersSearch.bind(adminViews);
window.app.adminCustomersPage = adminViews.adminCustomersPage.bind(adminViews);
window.app.adminMarkSettled = adminViews.adminMarkSettled.bind(adminViews);
window.app.openOrderDetails = adminViews.openOrderDetails.bind(adminViews);
window.app.closeOrderDetails = adminViews.closeOrderDetails.bind(adminViews);
window.app.adminReassignSeller = adminViews.adminReassignSeller.bind(adminViews);
window.app.adminResetFilters = adminViews.adminResetFilters.bind(adminViews);
window.app.adminExportCSV = adminViews.adminExportCSV.bind(adminViews);
window.app.adminRefresh = adminViews.adminRefresh.bind(adminViews);
window.app.adminOrdersDate = adminViews.adminOrdersDate.bind(adminViews);
window.app.adminOrdersCustomer = adminViews.adminOrdersCustomer.bind(adminViews);
window.app.adminOrdersSeller = adminViews.adminOrdersSeller.bind(adminViews);
window.app.adminOrdersSort = adminViews.adminOrdersSort.bind(adminViews);

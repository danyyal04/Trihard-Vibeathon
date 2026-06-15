// data-loader.js - High performance local querying engine for static datasets

import { store } from './store.js';

export const dataLoader = {
  // Query meals catalog with multiple parameters
  queryMeals({ search = '', category = 'All', sortBy = 'name', page = 1, limit = 12 } = {}) {
    let list = [...store.state.meals];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(m => 
        m.mealName.toLowerCase().includes(q) || 
        m.category.toLowerCase().includes(q) ||
        (m.ingredients && m.ingredients.some(i => i.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (category !== 'All') {
      list = list.filter(m => m.category === category);
    }

    // Sort order
    if (sortBy === 'name') {
      list.sort((a, b) => a.mealName.localeCompare(b.mealName));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    // Paginated results
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  },

  // Query order records (Admin context with 300+ items)
  queryOrders({ 
    search = '', 
    status = 'All', 
    sortBy = 'date-desc', 
    dateFilter = 'All', 
    customerFilter = 'All', 
    sellerFilter = 'All', 
    page = 1, 
    limit = 15 
  } = {}) {
    let list = [...store.state.orders];

    // 1. Search filter (Order ID, Customer Name, Phone, Seller, or Meal Name)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(o => {
        const customer = store.state.customers.find(c => c.customerId === o.customerId);
        const tracking = store.state.delivery.find(d => d.orderId === o.orderId);
        const meal = store.state.meals.find(m => m.mealId === o.mealId);
        
        const orderIdMatches = o.orderId.toLowerCase().includes(q);
        const customerNameMatches = customer && customer.name.toLowerCase().includes(q);
        const customerPhoneMatches = customer && customer.phone.toLowerCase().includes(q);
        const driverNameMatches = tracking && tracking.driverName && tracking.driverName.toLowerCase().includes(q);
        const mealNameMatches = meal && meal.mealName.toLowerCase().includes(q);

        // Also check custom details in tracking (for new orders)
        const customNameMatches = tracking && tracking.details && tracking.details.name && tracking.details.name.toLowerCase().includes(q);
        const customPhoneMatches = tracking && tracking.details && tracking.details.phone && tracking.details.phone.toLowerCase().includes(q);
        
        return orderIdMatches || customerNameMatches || customerPhoneMatches || driverNameMatches || mealNameMatches || customNameMatches || customPhoneMatches;
      });
    }

    // 2. Status filter (with alias resolution)
    if (status !== 'All') {
      const lowerStatus = status.toLowerCase();
      list = list.filter(o => {
        const oStatus = o.status.toLowerCase();
        if (lowerStatus === 'pending') return oStatus === 'received';
        if (lowerStatus === 'confirmed') return oStatus === 'received';
        if (lowerStatus === 'preparing') return oStatus === 'preparing';
        if (lowerStatus === 'ready') return oStatus === 'cooking';
        if (lowerStatus === 'out_for_delivery') return oStatus === 'out_for_delivery';
        if (lowerStatus === 'delivered' || lowerStatus === 'completed') return oStatus === 'delivered';
        if (lowerStatus === 'cancelled') return oStatus === 'cancelled';
        // Fallback to exact match
        return oStatus === lowerStatus;
      });
    }

    // 3. Date range filter
    if (dateFilter !== 'All' && dateFilter !== 'All Time') {
      const now = new Date();
      list = list.filter(o => {
        const oDate = new Date(o.orderDate);
        const diffTime = now - oDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        const filterStr = dateFilter.toLowerCase();
        if (filterStr === 'today') {
          return oDate.toDateString() === now.toDateString();
        } else if (filterStr === 'yesterday') {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return oDate.toDateString() === yesterday.toDateString();
        } else if (filterStr === '7days' || filterStr === 'last 7 days') {
          return diffDays >= 0 && diffDays <= 7;
        } else if (filterStr === '30days' || filterStr === 'last 30 days') {
          return diffDays >= 0 && diffDays <= 30;
        }
        return true;
      });
    }

    // 4. Customer filter
    if (customerFilter !== 'All') {
      list = list.filter(o => o.customerId === customerFilter);
    }

    // 5. Seller filter
    if (sellerFilter !== 'All') {
      list = list.filter(o => {
        const tracking = store.state.delivery.find(d => d.orderId === o.orderId);
        return tracking && tracking.driverName === sellerFilter;
      });
    }

    // 6. Sorting
    const sortVal = sortBy.toLowerCase();
    if (sortVal === 'date-asc' || sortVal === 'oldest') {
      list.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
    } else if (sortVal === 'amount-desc' || sortVal === 'highest amount') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === 'amount-asc' || sortVal === 'lowest amount') {
      list.sort((a, b) => a.amount - b.amount);
    } else if (sortVal === 'id-asc' || sortVal === 'order id asc') {
      list.sort((a, b) => a.orderId.localeCompare(b.orderId));
    } else if (sortVal === 'id-desc' || sortVal === 'order id desc') {
      list.sort((a, b) => b.orderId.localeCompare(a.orderId));
    } else {
      // Default: date-desc / newest
      list.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }

    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(o => {
      const customer = store.state.customers.find(c => c.customerId === o.customerId);
      const meal = store.state.meals.find(m => m.mealId === o.mealId);
      const tracking = store.state.delivery.find(d => d.orderId === o.orderId);
      
      const details = tracking ? tracking.details : null;
      
      return {
        ...o,
        customerName: details && details.name ? details.name : (customer ? customer.name : 'Guest User'),
        customerPhone: details && details.phone ? details.phone : (customer ? customer.phone : '--'),
        customerAddress: details && details.address ? details.address : (customer ? customer.location : 'No Address Provided'),
        customerEmail: customer ? customer.email : '--',
        customerMatric: details && details.matric ? details.matric : '--',
        customerFulfil: details && details.fulfil ? details.fulfil : 'Delivery',
        paymentMethod: details && details.payment ? details.payment : 'online',
        mealName: meal ? meal.mealName : 'Deleted Meal',
        mealPrice: meal ? meal.price : 0,
        mealCategory: meal ? meal.category : 'N/A',
        estimatedTime: tracking ? tracking.estimatedTime : '--:--',
        driverName: tracking ? tracking.driverName : 'Unassigned',
        driverPhone: tracking ? tracking.driverPhone : '--'
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  },

  // Query customer details (Admin context with 250+ items)
  queryCustomers({ search = '', page = 1, limit = 15 } = {}) {
    let list = [...store.state.customers];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        c.phone.includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }

    // Sort: alphabetically
    list.sort((a, b) => a.name.localeCompare(b.name));

    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map(c => {
      // Aggregate purchase histories
      const customerOrders = store.state.orders.filter(o => o.customerId === c.customerId);
      const totalSpend = customerOrders.reduce((sum, o) => sum + o.amount, 0);
      return {
        ...c,
        orderCount: customerOrders.length,
        totalSpend: parseFloat(totalSpend.toFixed(2))
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  },

  // Get ratings matching a meal ID
  getMealRatings(mealId) {
    return store.state.ratings
      .filter(r => r.mealId === mealId)
      .map(r => {
        const customer = store.state.customers.find(c => c.customerId === r.customerId);
        return {
          ...r,
          customerName: customer ? customer.name : 'Anonymous Reviewer'
        };
      });
  },

  // Fetch admin summary statistics
  getAdminMetrics() {
    const orders = store.state.orders;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
    const activeOrders = orders.filter(o => o.status !== 'delivered').length;
    
    // Average rating
    const ratings = store.state.ratings;
    const avgRating = ratings.length > 0 
      ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
      : 0;

    // Popular meals ranking
    const mealQuantities = {};
    orders.forEach(o => {
      mealQuantities[o.mealId] = (mealQuantities[o.mealId] || 0) + o.quantity;
    });

    const popularMeals = Object.entries(mealQuantities)
      .map(([mealId, quantity]) => {
        const meal = store.state.meals.find(m => m.mealId === mealId);
        return {
          mealId,
          quantity,
          mealName: meal ? meal.mealName : 'Unknown Meal',
          price: meal ? meal.price : 0,
          category: meal ? meal.category : 'N/A'
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales by date logic (last 7 days aggregate)
    const salesTimeline = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      salesTimeline[key] = { label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }), amount: 0 };
    }

    orders.forEach(o => {
      const dateKey = o.orderDate.split('T')[0];
      if (salesTimeline[dateKey]) {
        salesTimeline[dateKey].amount += o.amount;
      }
    });

    return {
      kpis: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        activeOrders,
        avgRating
      },
      popularMeals,
      revenueChart: Object.values(salesTimeline)
    };
  }
};

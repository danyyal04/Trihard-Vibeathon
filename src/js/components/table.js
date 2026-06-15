// table.js - Dynamic table layouts and pagination helpers for Admin view screens

export function renderPagination(page, totalPages, targetMethodName) {
  if (totalPages <= 1) return '';

  let buttons = '';

  buttons += `
    <button
      onclick="window.app.${targetMethodName}(${page - 1})"
      class="px-3.5 py-2 rounded-xl text-sm border border-secondary/15 bg-white text-secondary hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
      ${page <= 1 ? 'disabled' : ''}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      const isActive = i === page;
      const activeClass = isActive
        ? 'bg-primary text-white border-primary shadow-sm'
        : 'bg-white hover:bg-background-dark text-secondary border-secondary/15';
      buttons += `
        <button
          onclick="window.app.${targetMethodName}(${i})"
          class="px-4 py-2 rounded-xl text-sm border font-medium cursor-pointer transition-all active:scale-95 ${activeClass}"
        >
          ${i}
        </button>
      `;
    } else if (i === page - 2 || i === page + 2) {
      buttons += `<span class="px-2 text-secondary/40 text-sm">...</span>`;
    }
  }

  buttons += `
    <button
      onclick="window.app.${targetMethodName}(${page + 1})"
      class="px-3.5 py-2 rounded-xl text-sm border border-secondary/15 bg-white text-secondary hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
      ${page >= totalPages ? 'disabled' : ''}
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
    </button>
  `;

  return `
    <div class="flex items-center justify-between border-t border-secondary/10 pt-4 mt-6">
      <span class="text-xs text-secondary-light">Page ${page} of ${totalPages}</span>
      <div class="flex items-center gap-2">
        ${buttons}
      </div>
    </div>
  `;
}

export function renderOrderTable(items) {
  if (items.length === 0) {
    return `
      <div class="py-16 text-center text-secondary-light glass-card rounded-[2rem] border border-secondary/5 shadow-premium">
        <div class="text-5xl mb-4">📋</div>
        <p class="font-display font-semibold text-primary text-base">No matching orders found</p>
        <p class="text-xs text-secondary-light mt-1">Try adjusting your filters or search query.</p>
      </div>
    `;
  }

  // Common mapping for badges and labels
  const getStatusConfig = (status) => {
    switch (status) {
      case 'received':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
          label: 'Received'
        };
      case 'preparing':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
          label: 'Preparing'
        };
      case 'cooking':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200/60',
          label: 'Quality Check'
        };
      case 'out_for_delivery':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200/60',
          label: 'Out for Delivery'
        };
      case 'delivered':
        return {
          bg: 'bg-success/5 text-success-dark border-success/20',
          label: 'Delivered'
        };
      case 'cancelled':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-gray-50 text-gray-700 border-gray-200/60',
          label: status
        };
    }
  };

  // Build Desktop Rows
  const desktopRows = items.map(order => {
    const statusCfg = getStatusConfig(order.status);
    const settlementKey = `hmb_settled_${order.orderId}`;
    const isSettled = typeof window !== 'undefined' && localStorage.getItem(settlementKey) === 'true';
    
    const orderTime = new Date(order.orderDate).toLocaleString('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const paymentBadge = isSettled
      ? `<span class="px-2.5 py-1 inline-flex text-[10px] font-bold bg-success/10 text-success border border-success/20 rounded-full">✓ Settled</span>`
      : `<span class="px-2.5 py-1 inline-flex text-[10px] font-bold bg-secondary/10 text-secondary border border-secondary/20 rounded-full">⏳ Pending</span>`;

    return `
      <tr class="hover:bg-background/40 transition-colors border-b border-secondary/5 group">
        <!-- Order ID -->
        <td class="px-5 py-4 whitespace-nowrap text-sm font-bold text-primary font-display group-hover:text-accent transition-colors">
          #${order.orderId}
        </td>
        
        <!-- Customer Name -->
        <td class="px-5 py-4 whitespace-nowrap">
          <div class="text-sm font-semibold text-charcoal font-display">${order.customerName}</div>
        </td>

        <!-- Customer Phone -->
        <td class="px-5 py-4 whitespace-nowrap text-sm text-charcoal font-medium">
          ${order.customerPhone}
        </td>

        <!-- Order Date -->
        <td class="px-5 py-4 whitespace-nowrap text-xs text-secondary-light font-medium">
          ${orderTime}
        </td>

        <!-- Delivery Time -->
        <td class="px-5 py-4 whitespace-nowrap text-xs text-secondary-light font-semibold">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${order.estimatedTime}
          </span>
        </td>

        <!-- Items Ordered -->
        <td class="px-5 py-4 max-w-[200px] truncate">
          <div class="text-sm text-charcoal font-medium truncate" title="${order.mealName}">${order.mealName}</div>
          <div class="text-[10px] text-secondary-light font-semibold uppercase tracking-wider mt-0.5">${order.quantity} pack(s)</div>
        </td>

        <!-- Total Price -->
        <td class="px-5 py-4 whitespace-nowrap text-sm text-primary font-bold font-display">
          RM ${order.amount.toFixed(2)}
        </td>

        <!-- Payment Status -->
        <td class="px-5 py-4 whitespace-nowrap">
          ${paymentBadge}
        </td>

        <!-- Order Status -->
        <td class="px-5 py-4 whitespace-nowrap">
          <span class="px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${statusCfg.bg}">
            ${statusCfg.label}
          </span>
        </td>

        <!-- Seller -->
        <td class="px-5 py-4 whitespace-nowrap text-xs text-charcoal font-semibold">
          ${order.driverName}
        </td>

        <!-- Actions -->
        <td class="px-5 py-4 whitespace-nowrap text-right">
          <div class="flex items-center justify-end gap-2.5">
            <!-- Dropdown update status -->
            <select
              onchange="window.app.adminUpdateStatus('${order.orderId}', this.value)"
              class="bg-background hover:bg-background-dark border border-secondary/10 rounded-xl text-xs px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer font-semibold text-secondary transition-colors"
            >
              <option value="received" ${order.status === 'received' ? 'selected' : ''}>Received</option>
              <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
              <option value="cooking" ${order.status === 'cooking' ? 'selected' : ''}>Quality Check</option>
              <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
              <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>

            <!-- Details Trigger -->
            <button
              onclick="window.app.openOrderDetails('${order.orderId}')"
              class="bg-accent hover:bg-accent-dark text-white p-2 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md active:scale-95"
              title="View Details"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Build Mobile Cards
  const mobileCards = items.map(order => {
    const statusCfg = getStatusConfig(order.status);
    const settlementKey = `hmb_settled_${order.orderId}`;
    const isSettled = typeof window !== 'undefined' && localStorage.getItem(settlementKey) === 'true';

    const orderTime = new Date(order.orderDate).toLocaleString('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const paymentBadge = isSettled
      ? `<span class="px-2 py-0.5 text-[9px] font-bold bg-success/10 text-success border border-success/20 rounded-full">✓ Settled</span>`
      : `<span class="px-2 py-0.5 text-[9px] font-bold bg-secondary/10 text-secondary border border-secondary/20 rounded-full">⏳ Pending</span>`;

    return `
      <div class="bg-white rounded-3xl p-5 border border-secondary/10 shadow-premium flex flex-col gap-4">
        <!-- Top row: ID, Date, Actions -->
        <div class="flex items-center justify-between pb-3 border-b border-secondary/5">
          <div>
            <span class="text-sm font-bold text-primary font-display block">#${order.orderId}</span>
            <span class="text-[10px] text-secondary-light font-medium mt-0.5 block">${orderTime}</span>
          </div>
          <button
            onclick="window.app.openOrderDetails('${order.orderId}')"
            class="bg-accent hover:bg-accent-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            Details
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>
          </button>
        </div>

        <!-- Middle Info: Customer details, Items, Total -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-secondary-light block font-semibold uppercase tracking-wider text-[9px]">Customer</span>
            <span class="text-charcoal font-semibold font-display mt-0.5 block">${order.customerName}</span>
            <span class="text-secondary mt-0.5 block font-medium">${order.customerPhone}</span>
          </div>
          <div>
            <span class="text-secondary-light block font-semibold uppercase tracking-wider text-[9px]">Product</span>
            <span class="text-charcoal font-semibold mt-0.5 block truncate">${order.mealName}</span>
            <span class="text-secondary-light mt-0.5 block font-medium">${order.quantity} pack(s)</span>
          </div>
          <div>
            <span class="text-secondary-light block font-semibold uppercase tracking-wider text-[9px]">Total Amount</span>
            <span class="text-primary font-bold font-display text-sm mt-0.5 block">RM ${order.amount.toFixed(2)}</span>
          </div>
          <div>
            <span class="text-secondary-light block font-semibold uppercase tracking-wider text-[9px]">Seller (Courier)</span>
            <span class="text-charcoal mt-0.5 block font-semibold">${order.driverName}</span>
          </div>
        </div>

        <!-- Bottom row: Badges and quick status selector -->
        <div class="flex items-center justify-between pt-3 border-t border-secondary/5 gap-3">
          <div class="flex items-center gap-1.5">
            <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${statusCfg.bg}">
              ${statusCfg.label}
            </span>
            ${paymentBadge}
          </div>
          <select
            onchange="window.app.adminUpdateStatus('${order.orderId}', this.value)"
            class="bg-background border border-secondary/15 rounded-xl text-xs px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer font-semibold text-secondary transition-all w-32"
          >
            <option value="received" ${order.status === 'received' ? 'selected' : ''}>Received</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="cooking" ${order.status === 'cooking' ? 'selected' : ''}>Quality Check</option>
            <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- Desktop View -->
    <div class="hidden lg:block overflow-hidden rounded-[2rem] border border-secondary/10 bg-white shadow-premium">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-secondary/10 text-left border-collapse">
          <thead>
            <tr class="bg-background-dark/30">
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Order ID</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Customer</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Phone</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Order Date</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Delivery Time</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Items Ordered</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Total Price</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Payment</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Order Status</th>
              <th class="px-5 py-4 text-xs font-bold text-secondary uppercase tracking-wider font-display">Seller</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-secondary uppercase tracking-wider font-display">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-secondary/5 font-sans">
            ${desktopRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile / Tablet View -->
    <div class="lg:hidden flex flex-col gap-4">
      ${mobileCards}
    </div>
  `;
}

export function renderCustomerTable(items) {
  if (items.length === 0) {
    return `
      <div class="py-12 text-center text-secondary-light">
        No customer profiles found.
      </div>
    `;
  }

  const rows = items.map(c => {
    return `
      <tr class="hover:bg-background/20 transition-colors border-b border-secondary/5">
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-semibold text-primary font-display">${c.name}</div>
          <div class="text-xs text-secondary-light">${c.email}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal">${c.phone}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-charcoal max-w-xs truncate" title="${c.location}">${c.location}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-light">
          ${new Date(c.joinDate).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-primary">${c.orderCount}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary text-right font-display">
          RM ${c.totalSpend.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary/10">
        <thead>
          <tr class="bg-background-dark/30">
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Name</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Phone</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Location</th>
            <th class="px-6 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Member Since</th>
            <th class="px-6 py-3.5 text-center text-xs font-bold text-secondary uppercase tracking-wider">Orders</th>
            <th class="px-6 py-3.5 text-right text-xs font-bold text-secondary uppercase tracking-wider">Total Spend (RM)</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary/5">
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

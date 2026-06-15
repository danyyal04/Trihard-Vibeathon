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
      <div class="py-12 text-center text-secondary-light">
        <div class="text-4xl mb-3">📋</div>
        No matching orders found.
      </div>
    `;
  }

  const rows = items.map(order => {
    let statusClass = '';
    let statusLabel = '';

    switch (order.status) {
      case 'received':
        statusClass = 'bg-blue-100 text-blue-700 border-blue-200';
        statusLabel = 'Received';
        break;
      case 'preparing':
        statusClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
        statusLabel = 'Preparing';
        break;
      case 'cooking':
        statusClass = 'bg-orange-100 text-orange-700 border-orange-200';
        statusLabel = 'Quality Check';
        break;
      case 'out_for_delivery':
        statusClass = 'bg-purple-100 text-purple-700 border-purple-200';
        statusLabel = 'Out for Delivery';
        break;
      case 'delivered':
        statusClass = 'bg-success/10 text-success-dark border-success/20';
        statusLabel = 'Delivered';
        break;
      default:
        statusClass = 'bg-gray-100 text-gray-800 border-gray-200';
        statusLabel = order.status;
    }

    // Settlement: only delivered orders can be settled
    const isDelivered = order.status === 'delivered';
    const settlementKey = `hmb_settled_${order.orderId}`;
    const isSettled = typeof window !== 'undefined' && localStorage.getItem(settlementKey) === 'true';
    let settlementBadge = '';
    if (!isDelivered) {
      settlementBadge = `<span class="text-[10px] text-secondary-light italic">Pending delivery</span>`;
    } else if (isSettled) {
      settlementBadge = `<span class="px-2 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success border border-success/20">✓ Settled</span>`;
    } else {
      settlementBadge = `
        <button
          onclick="window.app.adminMarkSettled('${order.orderId}')"
          class="px-3 py-1 rounded-full text-[10px] font-bold bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all cursor-pointer"
        >
          Mark Settled
        </button>
      `;
    }

    const orderTime = new Date(order.orderDate).toLocaleString('en-MY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <tr class="hover:bg-background/20 transition-colors border-b border-secondary/5">
        <td class="px-4 py-4 whitespace-nowrap text-sm font-semibold text-primary font-display">
          #${order.orderId}
        </td>
        <td class="px-4 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-charcoal">${order.customerName}</div>
        </td>
        <td class="px-4 py-4">
          <div class="text-sm text-charcoal font-medium max-w-[180px] truncate" title="${order.mealName}">${order.mealName}</div>
          <div class="text-xs text-secondary-light">${order.quantity} pack(s)</div>
        </td>
        <td class="px-4 py-4 whitespace-nowrap text-sm text-charcoal font-semibold">
          RM ${order.amount.toFixed(2)}
        </td>
        <td class="px-4 py-4 whitespace-nowrap text-xs text-secondary-light">
          ${orderTime}
        </td>
        <td class="px-4 py-4 whitespace-nowrap">
          <span class="px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td class="px-4 py-4 whitespace-nowrap text-center">
          ${settlementBadge}
        </td>
        <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
          <select
            onchange="window.app.adminUpdateStatus('${order.orderId}', this.value)"
            class="bg-white border border-secondary/15 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:border-accent cursor-pointer transition-colors"
          >
            <option value="received" ${order.status === 'received' ? 'selected' : ''}>Received</option>
            <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
            <option value="cooking" ${order.status === 'cooking' ? 'selected' : ''}>Quality Check</option>
            <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary/10">
        <thead>
          <tr class="bg-background-dark/30">
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Order ID</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Customer</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Product</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Total (RM)</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Date</th>
            <th class="px-4 py-3.5 text-left text-xs font-bold text-secondary uppercase tracking-wider">Status</th>
            <th class="px-4 py-3.5 text-center text-xs font-bold text-secondary uppercase tracking-wider">Settlement</th>
            <th class="px-4 py-3.5 text-right text-xs font-bold text-secondary uppercase tracking-wider">Update</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary/5">
          ${rows}
        </tbody>
      </table>
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

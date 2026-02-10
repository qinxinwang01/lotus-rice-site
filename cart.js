(function () {
  'use strict';

  /* ─── XSS Helpers ──────────────────────────────── */
  function escapeHTML(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ─── State ────────────────────────────────────── */
  var cart = [];
  var STORAGE_KEY = 'lotusrice_cart';

  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }
    catch (e) { /* localStorage unavailable — in-memory only */ }
  }

  function loadCart() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      if (data) cart = JSON.parse(data);
    } catch (e) { /* localStorage unavailable */ }
  }

  /* ─── Cart Operations ──────────────────────────── */
  function addItem(name, price) {
    var existing = cart.find(function (i) { return i.name === name; });
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }
    saveCart();
  }

  function removeItem(name) {
    cart = cart.filter(function (i) { return i.name !== name; });
    saveCart();
  }

  function updateQty(name, delta) {
    var item = cart.find(function (i) { return i.name === name; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeItem(name);
    } else {
      saveCart();
    }
  }

  function getTotal() {
    return cart.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
  }

  function getItemCount() {
    return cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
  }

  function clearCart() {
    cart = [];
    saveCart();
  }

  /* ─── UI: Badge ────────────────────────────────── */
  function renderBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var count = getItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  /* ─── UI: Drawer ───────────────────────────────── */
  function renderDrawer() {
    var body = document.getElementById('cartBody');
    var footer = document.getElementById('cartFooter');
    if (!body || !footer) return;

    if (cart.length === 0) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<p>Your cart is empty.</p>' +
          '<a href="menu.html" class="btn btn--sm btn--outline">Browse Menu</a>' +
        '</div>';
      footer.innerHTML = '';
      return;
    }

    var html = '';
    cart.forEach(function (item) {
      html +=
        '<div class="cart-item">' +
          '<div class="cart-item__info">' +
            '<span class="cart-item__name">' + escapeHTML(item.name) + '</span>' +
            '<span class="cart-item__price">$' + escapeHTML(item.price.toFixed(2)) + '</span>' +
          '</div>' +
          '<div class="cart-item__controls">' +
            '<button class="cart-item__qty-btn" data-action="decrease" data-name="' + escapeAttr(item.name) + '">&minus;</button>' +
            '<span class="cart-item__qty">' + item.qty + '</span>' +
            '<button class="cart-item__qty-btn" data-action="increase" data-name="' + escapeAttr(item.name) + '">+</button>' +
            '<span class="cart-item__line-total">$' + escapeHTML((item.price * item.qty).toFixed(2)) + '</span>' +
            '<button class="cart-item__remove" data-action="remove" data-name="' + escapeAttr(item.name) + '">&times;</button>' +
          '</div>' +
        '</div>';
    });
    body.innerHTML = html;

    var total = getTotal();
    footer.innerHTML =
      '<div class="cart-total">' +
        '<span>Subtotal</span>' +
        '<span>$' + escapeHTML(total.toFixed(2)) + '</span>' +
      '</div>' +
      '<a href="checkout.html" class="btn btn--primary" style="width:100%;text-align:center;">Proceed to Checkout</a>';
  }

  /* ─── UI: Checkout Page ────────────────────────── */
  function renderCheckoutPage() {
    var content = document.getElementById('checkoutContent');
    if (!content) return;

    if (cart.length === 0) {
      content.innerHTML =
        '<div class="checkout-empty">' +
          '<p>Your cart is empty.</p>' +
          '<a href="menu.html" class="btn btn--sm btn--outline">Browse Menu</a>' +
        '</div>';
      return;
    }

    var rows = '';
    cart.forEach(function (item) {
      rows +=
        '<tr>' +
          '<td>' + escapeHTML(item.name) + '</td>' +
          '<td>$' + escapeHTML(item.price.toFixed(2)) + '</td>' +
          '<td>' + item.qty + '</td>' +
          '<td>$' + escapeHTML((item.price * item.qty).toFixed(2)) + '</td>' +
        '</tr>';
    });

    var subtotal = getTotal();
    var tax = subtotal * 0.07;
    var total = subtotal + tax;

    content.innerHTML =
      '<table class="checkout-table">' +
        '<thead><tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<div class="checkout-summary">' +
        '<div class="checkout-summary__row"><span>Subtotal</span><span>$' + escapeHTML(subtotal.toFixed(2)) + '</span></div>' +
        '<div class="checkout-summary__row"><span>Tax (7%)</span><span>$' + escapeHTML(tax.toFixed(2)) + '</span></div>' +
        '<div class="checkout-summary__row checkout-summary__row--total"><span>Total</span><span>$' + escapeHTML(total.toFixed(2)) + '</span></div>' +
      '</div>' +
      '<button class="btn btn--primary" id="payBtn" style="width:100%;text-align:center;margin-top:1.5rem;">Proceed to Payment</button>';

    document.getElementById('payBtn').addEventListener('click', function () {
      alert('Demo: Payment of $' + total.toFixed(2) + ' received! Thank you for your order.');
      clearCart();
      renderBadge();
      renderCheckoutPage();
    });
  }

  /* ─── Drawer Open / Close ──────────────────────── */
  function openDrawer() {
    var overlay = document.getElementById('cartOverlay');
    var drawer = document.getElementById('cartDrawer');
    if (!overlay || !drawer) return;
    renderDrawer();
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    var overlay = document.getElementById('cartOverlay');
    var drawer = document.getElementById('cartDrawer');
    if (!overlay || !drawer) return;
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ─── Init ─────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    renderBadge();

    // Cart icon
    var cartBtn = document.getElementById('cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openDrawer);

    // Drawer close
    var closeBtn = document.getElementById('cartClose');
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Overlay click
    var overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Add-to-cart buttons (menu page)
    var addBtns = document.querySelectorAll('.menu-item__add');
    addBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.menu-item');
        var name = item.dataset.name;
        var price = parseFloat(item.dataset.price);
        addItem(name, price);
        renderBadge();
        btn.classList.add('menu-item__add--added');
        btn.textContent = '\u2713';
        setTimeout(function () {
          btn.classList.remove('menu-item__add--added');
          btn.textContent = '+';
        }, 600);
      });
    });

    // Event delegation on cart body
    var cartBody = document.getElementById('cartBody');
    if (cartBody) {
      cartBody.addEventListener('click', function (e) {
        var t = e.target;
        var action = t.dataset.action;
        var name = t.dataset.name;
        if (!action || !name) return;
        if (action === 'increase') updateQty(name, 1);
        else if (action === 'decrease') updateQty(name, -1);
        else if (action === 'remove') removeItem(name);
        renderBadge();
        renderDrawer();
      });
    }

    // Checkout page
    renderCheckoutPage();
  });
})();

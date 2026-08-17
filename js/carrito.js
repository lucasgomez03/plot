document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     CARRITO DE COMPRAS
  ========================= */

  const cartToggle = document.querySelector('.cart-toggle');
  const cartPanel = document.querySelector('.cart-panel');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartItemsList = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const cartTotal = document.querySelector('.cart-total');
  const closeCartButton = document.querySelector('.close-cart');
  const checkoutButton = document.querySelector('.checkout-btn');

  const STORAGE_KEY = 'plot_carrito';

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (err) {
      return [];
    }
  }

  const state = {
    items: loadCart()
  };

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (err) {
      /* localStorage no disponible: el carrito sigue funcionando en memoria */
    }
  }

  function openCart() {
    if (!cartPanel) return;
    cartPanel.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
  }

  function closeCart() {
    if (!cartPanel) return;
    cartPanel.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
  }

  if (cartToggle) {
    cartToggle.addEventListener('click', () => {
      if (cartPanel && cartPanel.classList.contains('open')) {
        closeCart();
      } else {
        openCart();
      }
    });
  }

  if (closeCartButton) {
    closeCartButton.addEventListener('click', closeCart);
  }

  if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCart();
  });

  document.querySelectorAll('.book-card button').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.book-card');
      const title = card?.querySelector('h3')?.textContent.trim() || 'Producto';
      const priceText = card?.querySelector('h4')?.textContent.trim() || '$0';
      const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;

      const existing = state.items.find((item) => item.title === title);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ title, price, quantity: 1 });
      }

      saveCart();
      renderCart();
      openCart();
    });
  });

  function renderCart() {
    if (!cartItemsList || !cartCount || !cartTotal) return;

    cartItemsList.innerHTML = '';

    if (state.items.length === 0) {
      cartItemsList.innerHTML = '<li class="empty-cart">Tu carrito está vacío.</li>';
      cartCount.textContent = '0';
      cartTotal.textContent = '$0';
      if (checkoutButton) checkoutButton.disabled = true;
      return;
    }

    let total = 0;
    state.items.forEach((item) => {
      total += item.price * item.quantity;
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `
        <div>
          <strong>${item.title}</strong>
          <p>$${item.price.toLocaleString('es-AR')} x ${item.quantity}</p>
        </div>
        <button class="remove-item" data-title="${item.title}" aria-label="Quitar ${item.title}">×</button>
      `;
      cartItemsList.appendChild(li);
    });

    cartCount.textContent = state.items.reduce((sum, item) => sum + item.quantity, 0).toString();
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    if (checkoutButton) checkoutButton.disabled = false;

    cartItemsList.querySelectorAll('.remove-item').forEach((removeButton) => {
      removeButton.addEventListener('click', () => {
        const title = removeButton.getAttribute('data-title');
        state.items = state.items.filter((item) => item.title !== title);
        saveCart();
        renderCart();
      });
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (state.items.length === 0) return;
      cartItemsList.innerHTML = '<li class="empty-cart">¡Gracias por tu compra! Te vamos a contactar para coordinar el pago y el envío.</li>';
      cartTotal.textContent = '$0';
      cartCount.textContent = '0';
      checkoutButton.disabled = true;
      state.items = [];
      saveCart();
      setTimeout(closeCart, 2500);
    });
  }

  renderCart();

  /* =========================
     FILTRO DE CATEGORÍAS (catalogo.html)
  ========================= */

  const filterButtons = document.querySelectorAll('.filter-btn');
  const bookCards = document.querySelectorAll('.book-card');

  if (filterButtons.length && bookCards.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const filtro = btn.dataset.filter;

        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        bookCards.forEach((card) => {
          const coincide = filtro === 'all' || card.dataset.categoria === filtro;
          card.classList.toggle('hidden', !coincide);
        });

        const dropdown = btn.closest('.category-dropdown');
        if (dropdown) dropdown.removeAttribute('open');
      });
    });
  }

  /* =========================
     MENÚ MOBILE (si existe)
  ========================= */

  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
    });
  }

  /* =========================
     FORMULARIO DE CONTACTO (EmailJS)
  ========================= */

  // 👉 Reemplazá estos 3 valores por los tuyos de https://dashboard.emailjs.com
  const EMAILJS_CONFIG = {
    publicKey: '14Ah8OLEyQi3DQtMe',
    serviceId: 'service_r9vz5p4',
    templateId: 'template_q02bojj'
  };

  const contactForm = document.querySelector('.contact-form');
  const formMessage = document.querySelector('.form-message');

  if (contactForm) {
    const emailjsListo =
      typeof emailjs !== 'undefined' &&
      EMAILJS_CONFIG.publicKey !== 'TU_PUBLIC_KEY' &&
      EMAILJS_CONFIG.serviceId !== 'TU_SERVICE_ID' &&
      EMAILJS_CONFIG.templateId !== 'TU_TEMPLATE_ID';

    if (typeof emailjs !== 'undefined' && emailjsListo) {
      emailjs.init(EMAILJS_CONFIG.publicKey);
    } else if (typeof emailjs !== 'undefined') {
      console.warn('EmailJS: falta configurar publicKey / serviceId / templateId en carrito.js');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      contactForm.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));

      const nombre = contactForm.querySelector('[name="nombre"]');
      const apellido = contactForm.querySelector('[name="apellido"]');
      const email = contactForm.querySelector('[name="email"]');
      const telefono = contactForm.querySelector('[name="telefono"]');
      const libro = contactForm.querySelector('[name="libro"]');
      const mensaje = contactForm.querySelector('[name="mensaje"]');

      const errores = [];

      [nombre, apellido].forEach((campo) => {
        if (campo && !campo.value.trim()) {
          campo.classList.add('invalid');
          errores.push('nombre');
        }
      });

      if (!email || !email.value.trim()) {
        email?.classList.add('invalid');
        errores.push('email');
      } else if (!emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        errores.push('email-formato');
      }

      if (mensaje && !mensaje.value.trim()) {
        mensaje.classList.add('invalid');
        errores.push('mensaje');
      }

      if (!formMessage) return;

      if (errores.length > 0) {
        formMessage.textContent = 'Revisá los campos marcados: completá tu nombre, apellido, un email válido y tu mensaje.';
        formMessage.classList.remove('success');
        formMessage.classList.add('error');
        return;
      }

      const nombreCompleto = `${nombre.value.trim()} ${apellido.value.trim()}`.trim();

      if (!emailjsListo) {
        formMessage.textContent = 'El formulario todavía no está conectado a un email de destino. Avisale al administrador del sitio.';
        formMessage.classList.remove('success');
        formMessage.classList.add('error');
        return;
      }

      const submitButton = contactForm.querySelector('button[type="submit"]');
      const textoOriginal = submitButton ? submitButton.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      const templateParams = {
        from_name: nombreCompleto,
        from_email: email.value.trim(),
        phone: telefono ? telefono.value.trim() : '',
        book: libro ? libro.value.trim() : '',
        message: mensaje.value.trim()
      };

      emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
        .then(() => {
          formMessage.textContent = `¡Gracias, ${nombreCompleto}! Tu consulta fue enviada y te vamos a responder a ${email.value.trim()}.`;
          formMessage.classList.remove('error');
          formMessage.classList.add('success');
          contactForm.reset();
        })
        .catch((error) => {
          console.error('EmailJS error:', error);
          formMessage.textContent = 'Ocurrió un error al enviar tu consulta. Probá de nuevo en unos minutos.';
          formMessage.classList.remove('success');
          formMessage.classList.add('error');
        })
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = textoOriginal;
          }
          setTimeout(() => {
            formMessage.classList.remove('success', 'error');
            formMessage.textContent = '';
          }, 6000);
        });
    });
  }

  /* Cerrar el carrito si se hace click fuera de él y fuera del botón que lo abre */
  document.addEventListener('click', (event) => {
    if (!cartPanel || !cartPanel.classList.contains('open')) return;
    const clickedInsideCart = cartPanel.contains(event.target);
    const clickedToggle = cartToggle?.contains(event.target);
    const clickedOverlay = event.target === cartOverlay;

    if (!clickedInsideCart && !clickedToggle && !clickedOverlay) {
      closeCart();
    }
  });
});

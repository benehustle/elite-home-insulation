/* ============================================
   ELITE HOME INSULATION — SCRIPT
   ============================================ */

/* ============================================
   1. LOAD INCLUDES (header + footer injection)
   ============================================ */
async function loadIncludes() {
  const headerPlaceholder = document.getElementById('header-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');

  const basePath = getBasePath();

  if (headerPlaceholder) {
    try {
      const res = await fetch(basePath + 'includes/header.html');
      if (res.ok) {
        headerPlaceholder.innerHTML = await res.text();
      }
    } catch (e) {
      console.warn('Could not load header.html', e);
    }
  }

  if (footerPlaceholder) {
    try {
      const res = await fetch(basePath + 'includes/footer.html');
      if (res.ok) {
        footerPlaceholder.innerHTML = await res.text();
      }
    } catch (e) {
      console.warn('Could not load footer.html', e);
    }
  }

  initNav();
  setActiveNavLink();
}

function getBasePath() {
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  return depth > 0 ? '../'.repeat(depth - (window.location.pathname.endsWith('.html') ? 1 : 0)).replace('../', '') : '';
}

/* ============================================
   2. INIT NAV (hamburger, scroll-shrink, drawer)
   ============================================ */
function initNav() {
  const header = document.querySelector('.header');
  const hamburger = document.querySelector('.nav__hamburger');
  const drawer = document.querySelector('.nav__drawer');
  const overlay = document.querySelector('.nav__overlay');

  if (!header) return;

  // Scroll-shrink header
  function handleScroll() {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (!hamburger || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-visible');
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);

  // Close drawer when a nav link is clicked
  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
      hamburger.focus();
    }
  });
}

/* ============================================
   3. SET ACTIVE NAV LINK
   ============================================ */
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav__link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Normalise for comparison
    const linkPath = href.replace(/^\.\.\//, '/').replace(/^\//, '');
    const currentFile = currentPath.split('/').pop() || 'index.html';

    if (
      href === currentPath ||
      currentFile === href ||
      currentFile === href.split('/').pop() ||
      (currentFile === '' && href.includes('index'))
    ) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   4. SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================
   5. SCROLL REVEAL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  document.querySelectorAll('.animate-stagger').forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.transitionDelay = `${i * 80}ms`;
      observer.observe(child);
    });
  });
}

/* ============================================
   6. COUNTER ANIMATION (stats bar)
   ============================================ */
function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.stat-number').forEach(el => {
      el.textContent = el.dataset.target + (el.dataset.suffix || '');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = parseInt(el.dataset.decimals) || 0;
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + (progress === 1 ? suffix : '');
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number').forEach(el => observer.observe(el));
}

/* ============================================
   7. STICKY CALL BAR
   ============================================ */
function initCallBar() {
  const callBar = document.querySelector('.call-bar');
  if (!callBar) return;

  // Check session dismiss
  if (sessionStorage.getItem('callBarDismissed')) return;

  // Show after 2s
  setTimeout(() => {
    callBar.classList.add('is-visible');
  }, 2000);

  const dismissBtn = callBar.querySelector('.call-bar__dismiss');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      callBar.classList.remove('is-visible');
      sessionStorage.setItem('callBarDismissed', '1');
    });
  }
}

/* ============================================
   8. CONTACT FORM (validation + success)
   ============================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successMsg = form.querySelector('.form-success');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => el.remove());
    form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
      el.style.borderColor = '';
    });

    // Validate required fields
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ef4444';
        const error = document.createElement('span');
        error.className = 'form-error';
        error.style.cssText = 'color:#ef4444;font-size:0.8125rem;display:block;margin-top:4px;';
        error.textContent = 'This field is required.';
        field.parentNode.appendChild(error);
      }
    });

    // Validate email format
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailField.value.trim())) {
        valid = false;
        emailField.style.borderColor = '#ef4444';
        const error = document.createElement('span');
        error.className = 'form-error';
        error.style.cssText = 'color:#ef4444;font-size:0.8125rem;display:block;margin-top:4px;';
        error.textContent = 'Please enter a valid email address.';
        emailField.parentNode.appendChild(error);
      }
    }

    if (!valid) return;

    // Read phone from HTML (not hardcoded)
    const phoneLink = document.querySelector('a[href^="tel:"]');
    const phoneDisplay = phoneLink ? phoneLink.textContent.trim() : '';

    // Show success
    if (successMsg) {
      form.querySelectorAll('.form-group, .form-row, .form-submit').forEach(el => {
        el.style.display = 'none';
      });
      successMsg.classList.add('is-visible');
      if (phoneDisplay) {
        successMsg.innerHTML = `<strong>Thanks — we'll be in touch soon!</strong><br>For urgent jobs call <a href="${phoneLink ? phoneLink.getAttribute('href') : '#'}" style="color:var(--color-primary-dark);font-weight:600;">${phoneDisplay}</a> directly.`;
      }
    }
  });
}

/* ============================================
   9. FAQ SMOOTH ACCORDION
   ============================================ */
function initFaq() {
  const faqItems = document.querySelectorAll('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const summary = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!summary || !answer) return;

    // Pre-set height for animation
    summary.addEventListener('click', (e) => {
      e.preventDefault();

      const isOpen = item.hasAttribute('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item && other.hasAttribute('open')) {
          other.removeAttribute('open');
          const otherAnswer = other.querySelector('.faq__answer');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      if (isOpen) {
        item.removeAttribute('open');
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
      } else {
        item.setAttribute('open', '');
        answer.style.overflow = 'hidden';
        answer.style.maxHeight = answer.scrollHeight + 'px';
        // After transition, remove height restriction for dynamic content
        answer.addEventListener('transitionend', () => {
          if (item.hasAttribute('open')) answer.style.maxHeight = 'none';
        }, { once: true });
      }
    });

    // Init CSS for animation
    answer.style.transition = 'max-height 0.3s ease';
    if (!item.hasAttribute('open')) {
      answer.style.maxHeight = '0';
      answer.style.overflow = 'hidden';
    }
  });
}

/* ============================================
   10. DOM CONTENT LOADED — INIT ALL
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  await loadIncludes();
  initSmoothScroll();
  initScrollAnimations();
  initCounters();
  initCallBar();
  initContactForm();
  initFaq();
});

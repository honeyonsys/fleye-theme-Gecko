/**
 * FLEYE THEME - ULTRA-ROBUST INTERACTIONS & MICRO-ANIMATIONS ENGINE
 * High-performance JavaScript animations, scroll reveal, ripple feedback,
 * cart event sync, and WhatsApp micro-interactions.
 */

(function () {
  'use strict';

  // Feature detection
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * 1. SCROLL REVEAL INTERSECTION OBSERVER ENGINE
   */
  function initScrollReveal() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const revealTargets = document.querySelectorAll(
      '.t4s-section-title, .t4s-top-heading, .t4s-product.t4s-pr-grid, .t4s-col-item, .t4s-banner-inner, .t4s-testimonial-item'
    );

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('fleye-revealed');
          observer.unobserve(el);
        }
      });
    }, observerOptions);

    revealTargets.forEach((target) => {
      if (!target.classList.contains('fleye-reveal')) {
        target.classList.add('fleye-reveal');
      }
      revealObserver.observe(target);
    });
  }

  /**
   * 2. MATERIAL-STYLE BUTTON RIPPLE FEEDBACK
   */
  function initButtonRipples() {
    if (prefersReducedMotion) return;

    document.addEventListener('click', (e) => {
      const button = e.target.closest(
        '.t4s-btn, .t4s-pr-item-btn, .t4s-product-form__submit, .whatsapp-float-button, .t4s-btn-custom'
      );
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const wave = document.createElement('span');
      wave.className = 'fleye-ripple-wave';

      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      wave.style.width = wave.style.height = `${diameter}px`;
      wave.style.left = `${e.clientX - rect.left}px`;
      wave.style.top = `${e.clientY - rect.top}px`;

      const existingWave = button.querySelector('.fleye-ripple-wave');
      if (existingWave) {
        existingWave.remove();
      }

      button.appendChild(wave);

      wave.addEventListener('animationend', () => {
        wave.remove();
      });
    }, { passive: true });
  }

  /**
   * 3. CART COUNT POP & SHIPPING BAR CELEBRATION
   */
  function initCartAnimations() {
    function triggerCartBadgePop() {
      const badges = document.querySelectorAll('.t4s-count-box, .t4s-cart-count');
      badges.forEach((badge) => {
        badge.classList.remove('fleye-pop');
        // Force reflow
        void badge.offsetWidth;
        badge.classList.add('fleye-pop');
      });
    }

    // Listen for theme cart events
    document.addEventListener('cart:refresh', triggerCartBadgePop);
    document.addEventListener('cart:updated', triggerCartBadgePop);
    document.addEventListener('cart:item-added', triggerCartBadgePop);

    // Watch mini-cart items removal for smooth slide-out transition
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-cart-remove], .t4s-mini_cart__remove');
      if (removeBtn) {
        const itemRow = removeBtn.closest('.t4s-mini_cart__item, .t4s-cart-item');
        if (itemRow) {
          itemRow.classList.add('fleye-item-removing');
        }
      }
    }, { passive: true });
  }

  /**
   * 4. WHATSAPP FLOATING WIDGET ENHANCEMENT
   */
  function initWhatsAppWidget() {
    const floatContainer = document.querySelector('.whatsapp-float-container');
    if (!floatContainer) return;

    const link = document.getElementById('whatsappTextLink');
    const floatBtn = floatContainer.querySelector('.whatsapp-float-button');

    // Auto-reveal friendly tooltip after 3.5s
    setTimeout(() => {
      if (link && !link.classList.contains('visible')) {
        link.classList.add('visible');
      }
    }, 3500);

    // Toggle function
    window.toggleText = function () {
      if (!link) return;
      if (link.classList.contains('visible')) {
        link.classList.remove('visible');
      } else {
        link.classList.add('visible');
      }
    };

    // Auto dismiss tooltip on scroll after user has scrolled far down
    let hasScrolledDismissed = false;
    window.addEventListener('scroll', () => {
      if (!hasScrolledDismissed && window.scrollY > 400) {
        hasScrolledDismissed = true;
        if (link && link.classList.contains('visible')) {
          link.classList.remove('visible');
        }
      }
    }, { passive: true });
  }

  /**
   * 5. SUBTLE 3D TILT EFFECT ON BANNER / HERO CARDS (DESKTOP)
   */
  function initTiltEffects() {
    if (prefersReducedMotion || window.innerWidth < 1025) return;

    const tiltCards = document.querySelectorAll('.t4s-banner-inner, .t4s-lookbook-single');
    tiltCards.forEach((card) => {
      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        card.style.transition = 'transform 0.15s ease-out, box-shadow 0.15s ease-out';
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const rotateX = (-y / rect.height) * 6;
          const rotateY = (x / rect.width) * 6;
          card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transition = 'transform 0.5s var(--fleye-ease-smooth), box-shadow 0.5s var(--fleye-ease-smooth)';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  /**
   * 6. SAFE, DEBOUNCED DUAL PRICES CLEANER
   */
  function initCleanDualPrices() {
    function cleanPrices() {
      const priceElements = document.querySelectorAll('.t4s-product-price');
      priceElements.forEach((element) => {
        const text = element.textContent;
        if (text && text.includes('–')) {
          const newPrice = text.split('–')[0].trim();
          if (element.textContent !== newPrice) {
            element.textContent = newPrice;
          }
        }
      });
    }

    cleanPrices();

    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (let i = 0; i < mutations.length; i++) {
        if (mutations[i].type === 'childList') {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(cleanPrices, 150);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * 7. MOBILE SIDEBAR DRAWER SUBMENU ACCORDION
   */
  function initMobileNavigation() {
    document.addEventListener('click', (e) => {
      const menuContainer = e.target.closest('#t4s-menu-drawer, .t4s-drawer__left, .t4s-mb__menu');
      if (!menuContainer) return;

      const icon = e.target.closest('.t4s-mb-nav__icon');
      const parentLink = e.target.closest('.t4s-menu-item-has-children > a');

      if (!icon && !parentLink) return;

      const menuItem = (icon || parentLink).closest('.t4s-menu-item-has-children');
      if (!menuItem) return;

      const subMenu = menuItem.querySelector(':scope > .t4s-sub-menu, :scope > .t4s-sub-sub-menu, :scope > .t4s-sub-sub-sub-menu, :scope > ul');
      if (!subMenu) return;

      const href = parentLink ? (parentLink.getAttribute('href') || '') : '';
      const isOnlyIcon = menuItem.classList.contains('t4s-only_icon_true');
      const isHashLink = !href || href === '#' || href === '/' || href.startsWith('javascript:');

      if (icon || isHashLink || !isOnlyIcon) {
        if (e.cancelable && (icon || isHashLink)) {
          e.preventDefault();
        }

        const isOpened = menuItem.classList.contains('is--opend');

        if (isOpened) {
          menuItem.classList.remove('is--opend');
          subMenu.style.display = 'none';
        } else {
          menuItem.classList.add('is--opend');
          subMenu.style.display = 'block';
        }
      }
    });
  }

  /**
   * 8. FAST PREDICTIVE SEARCH & LIMITED CHARACTER DRESS MATCHER
   */
  function initFastPredictiveSearch() {
    let searchTimer = null;
    const cachedSearches = {};

    document.addEventListener('input', (e) => {
      const input = e.target.closest('#t4s-search-hidden input[data-input-search], .t4s-mini-search__input');
      if (!input) return;

      const container = input.closest('#t4s-search-hidden') || document.getElementById('t4s-search-hidden');
      if (!container) return;

      const rawVal = input.value.trim();
      clearTimeout(searchTimer);

      if (!rawVal || rawVal.length === 0) {
        return;
      }

      searchTimer = setTimeout(() => {
        const resultsContainer = container.querySelector('[data-results-search]');
        const skeleton = container.querySelector('[data-skeleton-search]');
        const title = container.querySelector('[data-title-search]');
        const viewAll = container.querySelector('[data-viewall-search]');

        if (skeleton) skeleton.classList.remove('t4s-dn');
        if (resultsContainer) resultsContainer.style.opacity = '0.5';

        // Query with wildcards and field expansion
        const searchUrl = `/search?type=product&options%5Bunavailable_products%5D=show&options%5Bprefix%5D=last&options%5Bfields%5D=title,body,tag,product_type,variants.title,vendor&q=${encodeURIComponent(rawVal)}*&section_id=search-hidden`;

        if (cachedSearches[rawVal]) {
          renderSearch(cachedSearches[rawVal]);
        } else {
          fetch(searchUrl)
            .then((res) => res.text())
            .then((html) => {
              const doc = new DOMParser().parseFromString(html, 'text/html');
              const newSection = doc.querySelector('#shopify-section-search-hidden, [data-sid="search-hidden"]');
              if (newSection) {
                cachedSearches[rawVal] = newSection.innerHTML;
                renderSearch(newSection.innerHTML);
              }
            })
            .catch((err) => {
              console.error('Search error:', err);
              if (skeleton) skeleton.classList.add('t4s-dn');
              if (resultsContainer) resultsContainer.style.opacity = '1';
            });
        }

        function renderSearch(content) {
          const tempDoc = new DOMParser().parseFromString(content, 'text/html');
          if (resultsContainer) {
            const newResults = tempDoc.querySelector('[data-results-search]');
            if (newResults) {
              resultsContainer.innerHTML = newResults.innerHTML;
            }
            resultsContainer.style.opacity = '1';
          }
          if (title) {
            const newTitle = tempDoc.querySelector('[data-title-search]');
            if (newTitle) {
              title.innerHTML = newTitle.innerHTML;
              title.style.display = 'block';
            }
          }
          if (viewAll) {
            const newViewAll = tempDoc.querySelector('[data-viewall-search]');
            if (newViewAll) {
              viewAll.innerHTML = newViewAll.innerHTML;
              viewAll.style.display = 'block';
            }
          }
          if (skeleton) skeleton.classList.add('t4s-dn');
        }
      }, 150);
    });
  }

  /**
   * 9. DESKTOP NAVIGATION SUBMENU MOUSEOVER SLIDE-DOWN ENGINE
   */
  function initDesktopNavigation() {
    const isDesktop = () => window.innerWidth >= 1025;

    // STRICTLY TARGET TOP-LEVEL NAVIGATION ITEMS WITH SUBMENUS
    const topNavItems = document.querySelectorAll(
      '.t4s-navigation .t4s-nav__ul > li.has--children'
    );

    if (!topNavItems.length) return;

    topNavItems.forEach((item) => {
      let closeTimer = null;

      const handleOpen = () => {
        if (!isDesktop()) return;
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }

        // Close sibling top-level dropdowns immediately
        const parentUl = item.closest('ul');
        if (parentUl) {
          parentUl.querySelectorAll(':scope > li.has--children').forEach((sibling) => {
            if (sibling !== item) {
              sibling.classList.remove('is-action__hover');
            }
          });
        }

        item.classList.add('is-action__hover');

        // Prevent dropdown from overflowing off-screen on the right edge
        const subMenu = item.querySelector(':scope > .t4s-sub-menu');
        if (subMenu && !item.classList.contains('menu-width__full')) {
          const rect = subMenu.getBoundingClientRect();
          if (rect.right > window.innerWidth - 15) {
            subMenu.style.left = 'auto';
            subMenu.style.right = '0';
          }
        }
      };

      const handleClose = () => {
        if (!isDesktop()) return;
        if (closeTimer) clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          item.classList.remove('is-action__hover');
        }, 180);
      };

      item.addEventListener('mouseenter', handleOpen);
      item.addEventListener('mouseleave', handleClose);
      item.addEventListener('focusin', handleOpen);
      item.addEventListener('focusout', (e) => {
        if (!item.contains(e.relatedTarget)) {
          handleClose();
        }
      });
    });

    // Handle nested level-2 flyout items inside dropdown menus
    const nestedNavItems = document.querySelectorAll(
      '.t4s-navigation .t4s-sub-menu .t4s-menu-item.has--children'
    );
    nestedNavItems.forEach((nestedItem) => {
      nestedItem.addEventListener('mouseenter', () => {
        if (!isDesktop()) return;
        nestedItem.classList.add('is--child-open');
      });
      nestedItem.addEventListener('mouseleave', () => {
        if (!isDesktop()) return;
        nestedItem.classList.remove('is--child-open');
      });
    });

    // Close all open desktop submenus on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.t4s-navigation')) {
        topNavItems.forEach((item) => item.classList.remove('is-action__hover'));
      }
    });
  }

  /**
   * INITIALIZATION
   */
  function init() {
    initScrollReveal();
    initButtonRipples();
    initCartAnimations();
    initWhatsAppWidget();
    initTiltEffects();
    initCleanDualPrices();
    initMobileNavigation();
    initFastPredictiveSearch();
    initDesktopNavigation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on dynamic content load
  document.addEventListener('theme:loaded', initScrollReveal);
  document.addEventListener('facets:loaded', initScrollReveal);
  document.addEventListener('shopify:section:load', initDesktopNavigation);
})();

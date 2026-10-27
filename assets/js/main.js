/* ORA — site interactions
   Plain ES2017, no dependencies. Works from file:// and static hosting. */
(() => {
  'use strict';

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  /* Current year ---------------------------------------------------------- */
  $$('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Header ---------------------------------------------------------------- */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Mobile menu ----------------------------------------------------------- */
  const menu = $('[data-menu]');
  const menuToggle = $('[data-menu-toggle]');
  let menuOpen = false;
  let lastFocused = null;

  const setMenu = (open) => {
    if (!menu || !menuToggle) return;
    menuOpen = open;
    menu.classList.toggle('is-open', open);
    menuToggle.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    document.body.classList.toggle('is-locked', open);
    if (open) {
      lastFocused = document.activeElement;
      window.setTimeout(() => menu.focus({ preventScroll: true }), 80);
    } else if (lastFocused) {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  if (menu && menuToggle) {
    menu.inert = true;
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.addEventListener('click', () => setMenu(!menuOpen));
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenu(false);
        return;
      }
      if (event.key !== 'Tab' || !menuOpen) return;
      const focusables = $$('a, button', menu).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === menu)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    const desktopQuery = window.matchMedia ? window.matchMedia('(min-width: 1001px)') : null;
    if (desktopQuery) {
      const handleDesktop = (event) => {
        if (event.matches && menuOpen) setMenu(false);
      };
      if (typeof desktopQuery.addEventListener === 'function') {
        desktopQuery.addEventListener('change', handleDesktop);
      } else if (typeof desktopQuery.addListener === 'function') {
        desktopQuery.addListener(handleDesktop);
      }
    }
  }

  /* Gallery filter -------------------------------------------------------- */
  const gallery = $('[data-gallery]');
  if (gallery) {
    const items = $$('.gallery-item', gallery);
    const filterButtons = $$('[data-filter]');
    const totalEl = $('[data-filter-total]');
    const emptyEl = $('[data-gallery-empty]');

    const counts = {};
    items.forEach((item) => {
      (item.dataset.category || '')
        .split(/\s+/)
        .filter(Boolean)
        .forEach((cat) => {
          counts[cat] = (counts[cat] || 0) + 1;
        });
    });

    filterButtons.forEach((btn) => {
      const key = btn.dataset.filter;
      const countEl = $('.count', btn);
      if (!countEl) return;
      countEl.textContent = key === 'all' ? String(items.length) : String(counts[key] || 0);
    });

    const applyFilter = (filter) => {
      let visible = 0;
      items.forEach((item) => {
        const cats = (item.dataset.category || '').split(/\s+/);
        const show = filter === 'all' || cats.includes(filter);
        item.hidden = !show;
        if (show) visible += 1;
      });
      filterButtons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter));
      });
      if (totalEl) totalEl.textContent = `${visible} 件作品`;
      if (emptyEl) emptyEl.hidden = visible > 0;
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
    applyFilter('all');
  }

  /* Lightbox -------------------------------------------------------------- */
  const lightbox = $('#lightbox');
  if (lightbox && gallery) {
    const image = $('#lightboxImage');
    const titleEl = $('#lightboxTitle');
    const metaEl = $('[data-lb-meta]', lightbox);
    const counterEl = $('[data-lb-counter]', lightbox);
    let current = 0;

    const visibleItems = () => $$('.gallery-item:not([hidden])', gallery);

    const render = (index) => {
      const items = visibleItems();
      if (!items.length) return;
      current = (index + items.length) % items.length;
      const item = items[current];
      const trigger = $('[data-lightbox]', item);
      if (!trigger) return;
      image.src = trigger.dataset.full || '';
      image.alt = $('img', item)?.alt || '';
      titleEl.textContent = trigger.dataset.title || '';
      metaEl.textContent = trigger.dataset.meta || '';
      counterEl.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    };

    const cleanupLightbox = () => {
      document.body.classList.remove('is-locked');
      image.src = '';
    };

    const closeLightbox = () => {
      if (typeof lightbox.close === 'function' && lightbox.open) {
        lightbox.close();
        return;
      }
      lightbox.removeAttribute('open');
      cleanupLightbox();
    };

    const openLightbox = (trigger) => {
      const items = visibleItems();
      const item = trigger.closest('.gallery-item');
      current = items.indexOf(item);
      render(current);
      document.body.classList.add('is-locked');
      if (typeof lightbox.showModal === 'function') {
        lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
      lightbox.focus({ preventScroll: true });
    };

    gallery.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-lightbox]');
      if (trigger) openLightbox(trigger);
    });

    $('[data-lb-close]', lightbox)?.addEventListener('click', closeLightbox);
    $('[data-lb-prev]', lightbox)?.addEventListener('click', () => render(current - 1));
    $('[data-lb-next]', lightbox)?.addEventListener('click', () => render(current + 1));

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('close', cleanupLightbox);

    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        render(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        render(current + 1);
      }
    });
  }

  /* Copy to clipboard ----------------------------------------------------- */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy || '';
      const state = $('[data-copy-state]', btn);
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', '');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        try {
          document.execCommand('copy');
        } catch (fallbackError) {
          /* Nothing else to try. */
        }
        helper.remove();
      }
      if (state) {
        const previous = state.textContent;
        state.textContent = '已复制';
        window.setTimeout(() => {
          state.textContent = previous;
        }, 1800);
      }
    });
  });

  /* Booking form ---------------------------------------------------------- */
  const form = $('[data-booking-form]');
  const success = $('[data-booking-success]');
  if (form) {
    const field = (name) => form.elements.namedItem(name);
    const nameEl = field('name');
    const contactEl = field('contact');
    const serviceEl = field('service');
    const dateEl = field('date');
    const timeEl = field('time');
    const noteEl = field('note');
    const agreeEl = field('agree');
    const agreeError = $('#agree-error');

    const pad = (value) => String(value).padStart(2, '0');
    const toISO = (date) =>
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    const today = new Date();
    const minDate = toISO(today);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 90);
    dateEl.min = minDate;
    dateEl.max = toISO(maxDate);

    const setError = (name, message) => {
      const wrapper = form.querySelector(`[data-field="${name}"]`);
      if (!wrapper) return;
      wrapper.classList.add('is-invalid');
      const input = wrapper.querySelector('input, select, textarea');
      if (input) input.setAttribute('aria-invalid', 'true');
      const error = $('.field-error', wrapper);
      if (error && message) error.textContent = message;
    };

    const clearError = (name) => {
      const wrapper = form.querySelector(`[data-field="${name}"]`);
      if (!wrapper) return;
      wrapper.classList.remove('is-invalid');
      const input = wrapper.querySelector('input, select, textarea');
      if (input) input.removeAttribute('aria-invalid');
    };

    const clearAgreeError = () => {
      if (!agreeError) return;
      agreeError.classList.remove('is-visible');
      agreeEl.removeAttribute('aria-invalid');
    };

    form.addEventListener('input', (event) => {
      const wrapper = event.target.closest('[data-field]');
      if (wrapper) clearError(wrapper.dataset.field);
      if (event.target === agreeEl) clearAgreeError();
    });
    form.addEventListener('change', (event) => {
      const wrapper = event.target.closest('[data-field]');
      if (wrapper) clearError(wrapper.dataset.field);
      if (event.target === agreeEl) clearAgreeError();
    });

    const validate = () => {
      ['name', 'contact', 'service', 'date', 'time'].forEach(clearError);
      clearAgreeError();
      let valid = true;
      let firstInvalid = null;

      const markInvalid = (name, message) => {
        setError(name, message);
        valid = false;
        if (!firstInvalid) {
          firstInvalid = form.querySelector(`[data-field="${name}"] input, [data-field="${name}"] select, [data-field="${name}"] textarea`);
        }
      };

      if (!nameEl.value.trim()) {
        markInvalid('name', '请填写你的称呼。');
      }

      const contact = contactEl.value.trim();
      const compact = contact.replace(/[\s-]/g, '');
      const isPhone = /^1[3-9]\d{9}$/.test(compact);
      const isWeChat = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/.test(compact);
      if (!contact || (!isPhone && !isWeChat)) {
        markInvalid('contact', '请填写 11 位手机号，或 6—20 位微信号。');
      }

      if (!serviceEl.value) {
        markInvalid('service', '请选择一项服务。');
      }

      const dateValue = dateEl.value;
      if (!dateValue) {
        markInvalid('date', '请选择到店日期。');
      } else if (dateValue < minDate) {
        markInvalid('date', '不能预约过去的日期。');
      } else if (dateValue > toISO(maxDate)) {
        markInvalid('date', '暂时只开放未来 90 天内的预约。');
      } else {
        const chosen = new Date(`${dateValue}T12:00:00`);
        if (chosen.getDay() === 1) {
          markInvalid('date', '周一闭店，请选择周二至周日的日期。');
        }
      }

      const timeValue = timeEl.value;
      if (!timeValue) {
        markInvalid('time', '请选择一个到店时段。');
      } else if (dateValue === minDate) {
        const now = new Date();
        const nowValue = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        if (timeValue <= nowValue) {
          markInvalid('time', '这个时段已经过了，请选更晚的时间或改天。');
        }
      }

      if (!agreeEl.checked) {
        valid = false;
        agreeEl.setAttribute('aria-invalid', 'true');
        agreeError?.classList.add('is-visible');
      }

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        else agreeEl.focus();
      }
      return valid;
    };

    const formatDate = (value) => {
      if (!value) return '—';
      const date = new Date(`${value}T12:00:00`);
      const day = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
      const weekday = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date);
      return `${day} · ${weekday}`;
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validate()) return;

      const prettyDate = formatDate(dateEl.value);
      $('[data-success-name]', success).textContent = nameEl.value.trim();
      $('[data-success-contact]', success).textContent = contactEl.value.trim();
      $('[data-success-service]', success).textContent = serviceEl.value;
      $('[data-success-date]', success).textContent = prettyDate;
      $('[data-success-time]', success).textContent = timeEl.value;
      $('[data-success-note]', success).textContent = noteEl.value.trim() || '—';

      const ref = `ORA-${dateEl.value.replace(/-/g, '').slice(2)}-${Math.floor(1000 + Math.random() * 9000)}`;
      $('[data-success-ref]', success).textContent = `预约编号 ${ref} · 演示`;

      form.hidden = true;
      success.hidden = false;
      document.body.classList.remove('is-locked');
      success.focus();
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });

    $('[data-booking-reset]', success)?.addEventListener('click', () => {
      form.reset();
      ['name', 'contact', 'service', 'date', 'time'].forEach(clearError);
      clearAgreeError();
      success.hidden = true;
      form.hidden = false;
      dateEl.min = minDate;
      dateEl.max = toISO(maxDate);
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      window.setTimeout(() => nameEl.focus(), reduceMotion ? 0 : 450);
    });
  }
})();

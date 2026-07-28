const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

function showFormMessage(type, text) {
  if (formNote) formNote.hidden = type !== 'success';
  if (formError) {
    formError.hidden = type !== 'error';
    if (type === 'error') formError.textContent = text;
  }
}

function hideFormMessages() {
  if (formNote) formNote.hidden = true;
  if (formError) formError.hidden = true;
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormMessages();

    const accessKey = typeof FORM_CONFIG !== 'undefined' ? FORM_CONFIG.accessKey : '';
    if (!accessKey) {
      showFormMessage('error', 'Форма не настроена. Укажите accessKey в файле config.js');
      return;
    }

    const formData = new FormData(contactForm);
    if (formData.get('botcheck')) return;

    const name = formData.get('name');
    const phone = formData.get('phone');
    const message = formData.get('message') || '—';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name,
          phone,
          message,
          subject: 'Новая заявка с сайта — массаж',
          from_name: 'Сайт массажа',
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Ошибка отправки');
      }

      contactForm.reset();
      showFormMessage('success');
      setTimeout(hideFormMessages, 6000);
    } catch {
      showFormMessage('error', 'Не удалось отправить заявку. Напишите в Telegram или WhatsApp.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';
      }
    }
  });
}

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.cert-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (!img) return;

      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

/* script.js — Comportements pour projet01.html
   Auteur: Copilot
   Date: 2025-12-25
*/

/* Utilise defer ou DOMContentLoaded pour être sûr que le DOM est chargé */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (!form) return;

  const nom = document.getElementById('nom');
  const prenom = document.getElementById('prenom');
  const email = document.getElementById('email');
  const sexeInputs = Array.from(document.querySelectorAll('input[name="sexe"]'));
  const status = document.getElementById('status');
  const submitBtn = form.querySelector('button[type="submit"]');
  const loginBtn = form.querySelector('button[type="button"]');

  // --- Accessibility / small utilities ---
  const setInvalid = (el, message) => {
    el.classList.add('input-error');
    el.setAttribute('aria-invalid', 'true');
    if (message) {
      let hint = el.parentElement.querySelector('.error-hint');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'error-hint';
        hint.role = 'alert';
        hint.style.color = '#b91c1c';
        hint.style.marginTop = '6px';
        hint.style.fontSize = '0.9rem';
        el.parentElement.appendChild(hint);
      }
      hint.textContent = message;
    }
  };

  const clearInvalid = (el) => {
    el.classList.remove('input-error');
    el.removeAttribute('aria-invalid');
    const hint = el.parentElement.querySelector('.error-hint');
    if (hint) hint.remove();
  };

  const focusAndScroll = (el) => {
    el.focus({preventScroll: true});
    el.scrollIntoView({behavior: 'smooth', block: 'center'});
  };

  // --- Validation logic ---
  const validate = () => {
    let ok = true;

    // clear previous errors
    [nom, prenom, email, status].forEach(clearInvalid);
    const sexeSelected = sexeInputs.some(i => i.checked);
    // validate nom
    if (!nom.value.trim()) {
      setInvalid(nom, 'Veuillez entrer votre nom.');
      ok = false;
    }
    // validate prenom
    if (!prenom.value.trim()) {
      setInvalid(prenom, 'Veuillez entrer votre prénom.');
      ok = false;
    }
    // validate email (HTML5 input=email does basic test; add extra)
    const emailValue = email.value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setInvalid(email, 'Veuillez entrer votre adresse e-mail.');
      ok = false;
    } else if (!emailRe.test(emailValue)) {
      setInvalid(email, 'Format d\'email invalide.');
      ok = false;
    }

    // validate sexe
    if (!sexeSelected) {
      // add a visible hint near the first radio
      const radioWrapper = sexeInputs[0].closest('form') || sexeInputs[0].parentElement;
      let hint = radioWrapper.querySelector('.sexe-error');
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'sexe-error';
        hint.style.color = '#b91c1c';
        hint.style.marginTop = '6px';
        hint.style.fontSize = '0.9rem';
        radioWrapper.appendChild(hint);
      }
      hint.textContent = 'Veuillez sélectionner votre sexe.';
      ok = false;
    } else {
      // remove sexe error if exists
      const radioWrapper = sexeInputs[0].closest('form') || sexeInputs[0].parentElement;
      const hint = radioWrapper.querySelector('.sexe-error');
      if (hint) hint.remove();
    }

    // status should be present (select has default so normally ok)

    // focus first invalid element
    if (!ok) {
      const firstInvalid = document.querySelector('[aria-invalid="true"], .sexe-error');
      if (firstInvalid) focusAndScroll(firstInvalid);
    }

    return ok;
  };

  // --- Modal de confirmation simple (accessible) ---
  const buildModal = (title, message) => {
    // container (overlay)
    const overlay = document.createElement('div');
    overlay.className = 'sr-modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.inset = 0;
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 9999;

    const dialog = document.createElement('div');
    dialog.className = 'sr-modal';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.style.background = '#fff';
    dialog.style.padding = '1.25rem';
    dialog.style.borderRadius = '10px';
    dialog.style.maxWidth = '420px';
    dialog.style.width = '90%';
    dialog.style.boxShadow = '0 10px 30px rgba(2,6,23,0.2)';

    const h = document.createElement('h2');
    h.textContent = title;
    h.style.margin = '0 0 0.5rem 0';
    h.style.fontSize = '1.1rem';

    const p = document.createElement('p');
    p.textContent = message;
    p.style.margin = '0 0 1rem 0';

    const btnWrap = document.createElement('div');
    btnWrap.style.display = 'flex';
    btnWrap.style.justifyContent = 'flex-end';
    btnWrap.style.gap = '8px';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.className = 'modal-ok';
    okBtn.style.background = '#0b6ed1';
    okBtn.style.color = '#fff';
    okBtn.style.border = 'none';
    okBtn.style.padding = '0.5rem 0.75rem';
    okBtn.style.borderRadius = '8px';
    okBtn.style.cursor = 'pointer';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.style.background = '#eef2ff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.padding = '0.5rem 0.75rem';
    cancelBtn.style.borderRadius = '8px';
    cancelBtn.style.cursor = 'pointer';

    btnWrap.appendChild(cancelBtn);
    btnWrap.appendChild(okBtn);
    dialog.appendChild(h);
    dialog.appendChild(p);
    dialog.appendChild(btnWrap);
    overlay.appendChild(dialog);

    // focus management
    overlay.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        overlay.remove();
      }
    });

    cancelBtn.addEventListener('click', () => overlay.remove());
    return { overlay, okBtn };
  };

  // --- Save example user to localStorage (safe demo, don't store sensitive data in production) ---
  const saveToLocal = (payload) => {
    try {
      const key = 'sar7_users_demo';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({...payload, created_at: new Date().toISOString()});
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      // ignore localStorage failures
      // console.warn('localStorage not available', e);
    }
  };

  // --- Submit handler ---
  form.addEventListener('submit', (ev) => {
    ev.preventDefault(); // progressive enhancement: we intercept
    // disable submit while validating
    submitBtn.disabled = true;

    // clear prior indicators
    [nom, prenom, email, status].forEach(clearInvalid);
    const sexeWrapperHint = document.querySelector('.sexe-error');
    if (sexeWrapperHint) sexeWrapperHint.remove();

    const ok = validate();
    if (!ok) {
      submitBtn.disabled = false;
      return;
    }

    // build demo payload
    const payload = {
      nom: nom.value.trim(),
      prenom: prenom.value.trim(),
      email: email.value.trim(),
      sexe: sexeInputs.find(i => i.checked)?.value || '',
      status: status.value
    };

    // Show modal confirm
    const { overlay, okBtn } = buildModal('Confirmer l\'inscription', 'Voulez-vous envoyer ces informations ?');
    document.body.appendChild(overlay);
    // move focus to modal OK
    okBtn.focus();

    const removeOverlay = () => {
      if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    };

    okBtn.addEventListener('click', () => {
      // For demo: save to localStorage and show succès
      saveToLocal(payload);

      removeOverlay();
      // show a short success message (non-blocking)
      const success = document.createElement('div');
      success.className = 'sr-success';
      success.setAttribute('role', 'status');
      success.textContent = 'Inscription envoyée — merci ! Redirection en cours...';
      success.style.position = 'fixed';
      success.style.right = '12px';
      success.style.bottom = '12px';
      success.style.background = '#ecfdf5';
      success.style.color = '#065f46';
      success.style.padding = '10px 14px';
      success.style.borderRadius = '8px';
      success.style.boxShadow = '0 8px 24px rgba(2,6,23,0.12)';
      document.body.appendChild(success);

      // optionally, submit to server: uncomment the next line to let the native POST happen
      // form.submit();

      // hide success after 2.2s and re-enable submit
      setTimeout(() => {
        success.remove();
        submitBtn.disabled = false;
        // reset form if desired:
        // form.reset();
      }, 2200);
    });

    // if user closes modal via cancel or escape we re-enable submit
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        removeOverlay();
        submitBtn.disabled = false;
      }
    });
  });

  // --- Login button behavior (Se connecter) ---
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // redirige vers une page de connexion ou ouvre un modal
      // change l'URL ci-dessous selon ta page de connexion
      window.location.href = 'login.html';
    });
  }

  // --- Small UX: clear error on input ---
  [nom, prenom, email, status].forEach(el => {
    el.addEventListener('input', () => clearInvalid(el));
  });
  sexeInputs.forEach(i => i.addEventListener('change', () => {
    const radioWrapper = sexeInputs[0].closest('form') || sexeInputs[0].parentElement;
    const hint = radioWrapper.querySelector('.sexe-error');
    if (hint) hint.remove();
  }));

  // --- Keyboard: submit on Enter when focus not on textarea (already handled by browser) ---
  // --- Extra: Highlight current nav/service link based on location hash ---
  const serviceLinks = document.querySelectorAll('#services nav a');
  serviceLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      // optionally smooth scroll or add active class
      serviceLinks.forEach(x => x.classList.remove('active-service'));
      a.classList.add('active-service');
    });
  });

  // End DOMContentLoaded
});

// Simple router highlight
(function(){
  const p = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('nav a').forEach(a => {
    if (a.getAttribute('href') === p) a.style.textDecoration = 'underline';
  });
})();

// Booking page logic
document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.querySelector('#date');
  const timeSelect = document.querySelector('#time');
  const bookingForm = document.querySelector('#booking-form');
  const bookingMsg = document.querySelector('#booking-msg');

  if (dateInput && timeSelect) {
    const loadSlots = async () => {
      const d = dateInput.value;
      if (!d) return;
      timeSelect.innerHTML = '<option value="">Ładowanie...</option>';
      try {
        const r = await fetch(`/api/slots?date=${encodeURIComponent(d)}`);
        const data = await r.json();
        if (!data.slots || !data.slots.length) {
          timeSelect.innerHTML = '<option value="">Brak wolnych terminów</option>';
        } else {
          timeSelect.innerHTML = '<option value="">Wybierz godzinę…</option>' + data.slots.map(s=>`<option>${s}</option>`).join('');
        }
      } catch (e) {
        timeSelect.innerHTML = '<option value="">Błąd pobierania slotów</option>';
      }
    };
    dateInput.addEventListener('change', loadSlots);
    if (dateInput.value) loadSlots();
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(bookingForm);
      const payload = Object.fromEntries(form.entries());
      try {
        const r = await fetch('/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        const data = await r.json();
        if (data.ok) {
          bookingMsg.textContent = 'Dziękujemy! Rezerwacja została złożona.';
          bookingForm.reset();
          timeSelect.innerHTML = '<option value="">Wybierz datę…</option>';
        } else {
          bookingMsg.textContent = data.error || 'Wystąpił błąd.';
        }
      } catch {
        bookingMsg.textContent = 'Błąd sieci.';
      }
    });
  }

  // Reviews page logic
  const reviewsWrap = document.querySelector('#reviews-wrap');
  const avgNode = document.querySelector('#avg-rating');
  const reviewForm = document.querySelector('#review-form');
  const reviewMsg = document.querySelector('#review-msg');

  async function loadReviews(limit) {
    try {
      const r = await fetch('/api/reviews' + (limit?`?limit=${limit}`:''));
      const data = await r.json();
      if (avgNode && data.avg != null) avgNode.textContent = `${data.avg}/5`;
      if (reviewsWrap) {
        reviewsWrap.innerHTML = (data.items || []).map(r => `
          <div class="card">
            <div class="stars">${Array.from({length:5},(_,i)=>`<span class="star ${i<r.rating?'':'muted'}">★</span>`).join('')}</div>
            <p style="margin:8px 0"><em>"${(r.content||'').replace(/"/g,'&quot;')}"</em></p>
            <div class="small">— ${r.name}, ${new Date(r.created_at).toLocaleDateString('pl-PL')}</div>
          </div>
        `).join('');
      }
    } catch(e) {
      if (reviewsWrap) reviewsWrap.textContent = 'Nie udało się pobrać opinii.';
    }
  }

  if (reviewsWrap) loadReviews(reviewsWrap.dataset.limit ? Number(reviewsWrap.dataset.limit) : undefined);

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(reviewForm);
      const payload = Object.fromEntries(form.entries());
      try {
        const r = await fetch('/api/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        const data = await r.json();
        if (data.ok) {
          reviewMsg.textContent = 'Dziękujemy! Opinia trafiła do moderacji.';
          reviewForm.reset();
        } else {
          reviewMsg.textContent = data.error || 'Wystąpił błąd.';
        }
      } catch {
        reviewMsg.textContent = 'Błąd sieci.';
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbar = document.getElementById('navbar');
  const authButtonsContainer = document.getElementById('auth-buttons');

  // Modals
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');
  const bookingModal = document.getElementById('booking-modal');
  const contactModal = document.getElementById('contact-modal');

  // Modal Buttons
  const loginNavBtn = document.getElementById('login-nav-btn');
  const signupNavBtn = document.getElementById('signup-nav-btn');
  const heroContactBtn = document.getElementById('hero-contact-btn');
  const heroBookingBtn = document.getElementById('hero-booking-btn');
  const destBookBtns = document.querySelectorAll('.dest-book-btn');
  const thailandCard = document.querySelector('.booking-card');

  // Close Buttons
  const closeLogin = document.getElementById('close-login');
  const closeSignup = document.getElementById('close-signup');
  const closeBooking = document.getElementById('close-booking');
  const closeContact = document.getElementById('close-contact');

  // Switch Links
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToLogin = document.getElementById('switch-to-login');

  // Forms
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const bookingForm = document.getElementById('booking-form');
  const contactForm = document.getElementById('contact-form');
  const subscribeForm = document.getElementById('subscribe-form');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- Session Management ---
  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  function updateNavbar() {
    if (currentUser) {
      authButtonsContainer.innerHTML = `
        <div class="user-menu">
          <button class="btn user-menu-btn">
            <span>👤 ${currentUser.name}</span>
          </button>
          <div class="user-menu-dropdown">
            <a href="#" id="view-bookings-btn">My Bookings</a>
            <a href="#" id="logout-btn">Logout</a>
          </div>
        </div>
      `;

      // Set booking modal defaults if open
      const bookingNameInput = document.getElementById('booking-name');
      const bookingEmailInput = document.getElementById('booking-email');
      if (bookingNameInput) bookingNameInput.value = currentUser.name;
      if (bookingEmailInput) bookingEmailInput.value = currentUser.email;

      // Event Listeners for new items
      document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });

      document.getElementById('view-bookings-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetchUserBookings();
      });
    } else {
      authButtonsContainer.innerHTML = `
        <a href="#" id="login-nav-btn">Login</a>
        <a href="#" class="sign-btn" id="signup-nav-btn">Sign Up</a>
      `;

      // Re-attach event listeners to recreated buttons
      document.getElementById('login-nav-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
      });
      document.getElementById('signup-nav-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal(signupModal);
      });
    }
  }

  function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateNavbar();
    showToast('Logged out successfully', 'success');
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '✗'}</span>
      <div>${message}</div>
    `;
    toastContainer.appendChild(toast);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 3000);
  }

  // --- Modal Helpers ---
  function openModal(modal) {
    // Fill client info if logged in
    if (modal === bookingModal && currentUser) {
      document.getElementById('booking-name').value = currentUser.name;
      document.getElementById('booking-email').value = currentUser.email;
    }
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Event Listeners to close on outside click
  [loginModal, signupModal, bookingModal, contactModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Attach triggers
  loginNavBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
  signupNavBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(signupModal); });
  heroContactBtn.addEventListener('click', () => openModal(contactModal));
  heroBookingBtn.addEventListener('click', () => openModal(bookingModal));

  // Destination specific booking triggers
  destBookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const destination = btn.getAttribute('data-destination');
      const selectElem = document.getElementById('booking-destination');
      if (selectElem) {
        selectElem.value = destination;
      }
      openModal(bookingModal);
    });
  });

  // Thailand card booking trigger
  if (thailandCard) {
    thailandCard.style.cursor = 'pointer';
    thailandCard.addEventListener('click', (e) => {
      // Don't trigger if they clicked inside the like button
      if (e.target.closest('.like-btn')) return;
      const selectElem = document.getElementById('booking-destination');
      if (selectElem) {
        selectElem.value = 'Thailand';
      }
      openModal(bookingModal);
    });
  }

  // Close triggers
  closeLogin.addEventListener('click', () => closeModal(loginModal));
  closeSignup.addEventListener('click', () => closeModal(signupModal));
  closeBooking.addEventListener('click', () => closeModal(bookingModal));
  closeContact.addEventListener('click', () => closeModal(contactModal));

  // Modal switches
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
  });
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
  });

  // --- Mobile Navigation Menu ---
  mobileMenuBtn.addEventListener('click', () => {
    navbar.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });

  // Close menu when clicking links
  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });

  // Close menu when clicking outside navbar
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && !mobileMenuBtn.contains(e.target) && navbar.classList.contains('active')) {
      navbar.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    }
  });

  // --- Form Submissions via AJAX (Fetch API) ---

  // 1. User Registration
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateNavbar();
        closeModal(signupModal);
        signupForm.reset();
      } else {
        showToast(data.error || 'Registration failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    }
  });

  // 2. User Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        currentUser = data.user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateNavbar();
        closeModal(loginModal);
        loginForm.reset();
      } else {
        showToast(data.error || 'Login failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    }
  });

  // 3. Contact Form Submission
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });
      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        closeModal(contactModal);
        contactForm.reset();
      } else {
        showToast(data.error || 'Submission failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    }
  });

  // 4. Booking Form Submission
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('booking-name').value;
    const email = document.getElementById('booking-email').value;
    const destination = document.getElementById('booking-destination').value;
    const date = document.getElementById('booking-date').value;
    const travelers = document.getElementById('booking-travelers').value;

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, destination, date, travelers })
      });
      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        closeModal(bookingModal);
        bookingForm.reset();
      } else {
        showToast(data.error || 'Booking failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    }
  });

  // 5. Newsletter Subscription
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('subscribe-email').value;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (response.ok) {
        showToast(data.message, 'success');
        subscribeForm.reset();
      } else {
        showToast(data.error || 'Subscription failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error, please try again.', 'error');
    }
  });

  // 6. View Bookings (Interactive Check)
  async function fetchUserBookings() {
    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(currentUser.email)}`);
      const bookings = await response.json();

      if (response.ok) {
        if (bookings.length === 0) {
          showToast("You don't have any bookings yet.", 'success');
        } else {
          const bookingList = bookings.map(b => `${b.destination} on ${b.date} (${b.travelers} traveler(s))`).join('\n');
          alert(`Your Current Bookings:\n\n${bookingList}`);
        }
      } else {
        showToast('Failed to fetch bookings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error fetching bookings.', 'error');
    }
  }

  // --- Like Button Logic ---
  const likeBtn = document.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card click
      const img = likeBtn.querySelector('img');
      likeBtn.classList.toggle('liked');
      if (likeBtn.classList.contains('liked')) {
        img.style.filter = 'hue-rotate(300deg) saturate(3)'; // turn pinkish-red
        showToast('Trip to Thailand added to favorites!', 'success');
      } else {
        img.style.filter = '';
        showToast('Trip to Thailand removed from favorites.', 'success');
      }
    });
  }

  // --- Initialize App ---
  updateNavbar();
});

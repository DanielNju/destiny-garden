// ======================================================
// DESTINY GARDENS - FOCUSED SCENE-CARD GUIDED TOUR
// UPDATED VERSION
// - Resume works
// - Pause works
// - User interaction pauses temporarily then resumes
// - Active section changes the whole site theme
// - Map shows pinned location by default
// - Route only loads after user asks for directions
// ======================================================

// ========== DOM ==========
const sections = [...document.querySelectorAll('.scene')];
const main = document.getElementById('main');
const progressDotsWrap = document.getElementById('progressDots');
const tourStatus = document.getElementById('tourStatus');
const tourLabel = document.getElementById('tourLabel');
const toggleTourBtn = document.getElementById('toggleTourBtn');
const restartTourBtn = document.getElementById('restartTourBtn');
const exploreFreeBtn = document.getElementById('exploreFreeBtn');

const modal = document.getElementById('previewModal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalPrice = document.getElementById('modalPrice');
const modalTag = document.getElementById('modalTag');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCloseBtn2 = document.getElementById('modalCloseBtn2');

const getDirectionsBtn = document.getElementById('getDirectionsBtn');
const useMyLocationBtn = document.getElementById('useMyLocationBtn');

const mapDisplay = document.getElementById('map-display');
const mapStatus = document.getElementById('map-status');
const userLocationDiv = document.getElementById('user-location');
const routeInfoDiv = document.getElementById('route-info');

// ========== GLOBAL STATE ==========
const state = {
  currentSection: 0,
  guidedEnabled: true,
  pausedByUser: false,
  inactiveDelay: 4200,
  baseSceneDelay: 11000,
  heroDelay: 12000,
  sectionScrollDuration: 2400,
  sceneTimer: null,
  resumeTimer: null,
  sectionScrollRAF: null,
  sliders: []
};

// ========== MAP STATE ==========
let map = null;
let userMarker = null;
let destinationMarker = null;
let routeLine = null;
let mapReady = false;

// Exact pinned Destiny Gardens location
const DESTINY_LAT = -1.1525083;
const DESTINY_LNG = 36.8962652;
const DESTINY_NAME = 'Destiny Gardens';

// ========== THEME ==========
function applyThemeBySection(sectionId) {
  const body = document.body;

  body.classList.remove(
    'theme-hero',
    'theme-events',
    'theme-activities',
    'theme-memories',
    'theme-map',
    'theme-booking'
  );

  const themeClassMap = {
    hero: 'theme-hero',
    events: 'theme-events',
    activities: 'theme-activities',
    memories: 'theme-memories',
    map: 'theme-map',
    booking: 'theme-booking'
  };

  const themeClass = themeClassMap[sectionId];
  if (themeClass) {
    body.classList.add(themeClass);
  }
}

// ========== EASING ==========
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ========== PROGRESS ==========
function buildProgressDots() {
  if (!progressDotsWrap) return;
  progressDotsWrap.innerHTML = '';

  sections.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    progressDotsWrap.appendChild(dot);
  });
}

function updateProgressDots() {
  if (!progressDotsWrap) return;
  [...progressDotsWrap.children].forEach((dot, i) => {
    dot.classList.toggle('active', i === state.currentSection);
  });
}

// ========== TOUR STATUS ==========
function setTourStatus(active, message) {
  if (!tourStatus || !tourLabel || !toggleTourBtn) return;
  tourStatus.classList.toggle('paused', !active);
  tourLabel.textContent = message;
  toggleTourBtn.textContent = active ? '⏸ Pause Tour' : '▶ Resume Tour';
}

// ========== SCROLL ==========
function stopAnimatedScroll() {
  if (state.sectionScrollRAF) {
    cancelAnimationFrame(state.sectionScrollRAF);
    state.sectionScrollRAF = null;
  }
}

function animatedScrollTo(targetY, duration = state.sectionScrollDuration) {
  stopAnimatedScroll();

  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      state.sectionScrollRAF = requestAnimationFrame(step);
    } else {
      state.sectionScrollRAF = null;
    }
  }

  state.sectionScrollRAF = requestAnimationFrame(step);
}

function scrollToSection(index) {
  if (!sections[index]) return;
  animatedScrollTo(sections[index].offsetTop, state.sectionScrollDuration);
}

function smoothScrollToElement(element, duration = state.sectionScrollDuration) {
  if (!element) return;
  animatedScrollTo(element.offsetTop, duration);
}

// ========== SECTION VISIBILITY ==========
function getMostVisibleSectionIndex() {
  let bestIndex = 0;
  let maxVisible = -1;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const visible = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
    );

    if (visible > maxVisible) {
      maxVisible = visible;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function getCurrentVisibleSection() {
  return sections[state.currentSection] || null;
}

function getSliderForSection(sectionEl) {
  if (!sectionEl) return null;
  return state.sliders.find(slider => slider.section === sectionEl) || null;
}

function syncVisibleSection() {
  const bestIndex = getMostVisibleSectionIndex();

  if (bestIndex !== state.currentSection) {
    state.currentSection = bestIndex;
    updateProgressDots();
    applyThemeBySection(sections[bestIndex].id);

    state.sliders.forEach(slider => {
      const active = slider.section === sections[bestIndex];
      slider.setSectionActive(active);
    });

    if (sections[bestIndex]?.id === 'map') {
      initMap();
      invalidateMapSoon();
    }

    scheduleNextScene();
  }
}

// ========== GUIDE ==========
function scheduleNextScene() {
  clearTimeout(state.sceneTimer);

  if (!state.guidedEnabled || state.pausedByUser) return;

  const sectionEl = getCurrentVisibleSection();
  const slider = getSliderForSection(sectionEl);

  let delay = state.baseSceneDelay;

  if (sectionEl && sectionEl.id === 'hero') {
    delay = state.heroDelay;
  }

  if (slider) {
    delay = slider.getRecommendedSectionDelay();
    slider.ensureAutoplay();
  }

  state.sceneTimer = setTimeout(() => {
    if (!state.guidedEnabled || state.pausedByUser) return;
    const next = (state.currentSection + 1) % sections.length;
    scrollToSection(next);
  }, delay);
}

function pauseGuideTemporarily() {
  if (!state.guidedEnabled) return;
  if (state.pausedByUser) return;

  clearTimeout(state.sceneTimer);
  clearTimeout(state.resumeTimer);
  stopAnimatedScroll();

  setTourStatus(false, 'Tour paused — interaction detected');

  state.sliders.forEach(slider => slider.pauseAutoplay());

  state.resumeTimer = setTimeout(() => {
    if (!state.guidedEnabled || state.pausedByUser) return;

    setTourStatus(true, 'Guided tour resumed');

    const currentIndex = getMostVisibleSectionIndex();
    state.currentSection = currentIndex;
    updateProgressDots();
    applyThemeBySection(sections[currentIndex]?.id);

    const currentSection = getCurrentVisibleSection();
    const currentSlider = getSliderForSection(currentSection);

    state.sliders.forEach(slider => {
      slider.setSectionActive(slider.section === currentSection);
    });

    if (currentSlider) {
      currentSlider.ensureAutoplay();
    }

    scheduleNextScene();
  }, state.inactiveDelay);
}

function onUserInteraction(event) {
  if (!state.guidedEnabled) return;
  if (state.pausedByUser) return;

  const target = event?.target;

  if (
    target &&
    target.closest(
      '#toggleTourBtn, #restartTourBtn, #exploreFreeBtn, .modal-close, #modalCloseBtn2'
    )
  ) {
    return;
  }

  pauseGuideTemporarily();
}

// ========== MAP HELPERS ==========
function setMapStatus(message) {
  if (mapStatus) {
    mapStatus.textContent = message;
  }
}

function setUserLocationText(message) {
  if (userLocationDiv) {
    userLocationDiv.innerHTML = message;
  }
}

function setRouteInfoText(message) {
  if (routeInfoDiv) {
    routeInfoDiv.innerHTML = message;
  }
}

function invalidateMapSoon() {
  if (!map) return;

  setTimeout(() => map.invalidateSize(), 250);
  setTimeout(() => map.invalidateSize(), 700);
}

function initMap() {
  if (mapReady || !mapDisplay || typeof L === 'undefined') return;

  map = L.map('map-display', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([DESTINY_LAT, DESTINY_LNG], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  destinationMarker = L.marker([DESTINY_LAT, DESTINY_LNG])
    .addTo(map)
    .bindPopup(`<b>${DESTINY_NAME}</b>`)
    .openPopup();

  mapReady = true;
  setMapStatus('Showing Destiny Gardens location.');
  setUserLocationText('Location access not used yet.');
  setRouteInfoText('Tap “Use My Location” or “Get Directions” to load your route.');
}

function clearExistingRoute() {
  if (routeLine && map) {
    map.removeLayer(routeLine);
    routeLine = null;
  }
}

function resetToPinnedLocation() {
  initMap();
  clearExistingRoute();

  if (destinationMarker) {
    destinationMarker.setLatLng([DESTINY_LAT, DESTINY_LNG]);
    destinationMarker.bindPopup(`<b>${DESTINY_NAME}</b>`).openPopup();
  }

  map.setView([DESTINY_LAT, DESTINY_LNG], 15);

  setMapStatus('Showing Destiny Gardens location.');
  
  setRouteInfoText('Tap “Use My Location” or “Get Directions” to load your route.');
}

function updateUserMarker(latitude, longitude, accuracy) {
  if (!map) return;

  if (userMarker) {
    userMarker.setLatLng([latitude, longitude]);
    userMarker.setPopupContent(`You are here<br>±${Math.round(accuracy)}m`);
  } else {
    userMarker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`You are here<br>±${Math.round(accuracy)}m`);
  }
}

function fetchRoute(userLat, userLng) {
  if (
    typeof userLat !== 'number' ||
    typeof userLng !== 'number' ||
    Number.isNaN(userLat) ||
    Number.isNaN(userLng)
  ) {
    setMapStatus('Showing Destiny Gardens location.');
    setRouteInfoText('Invalid location received.');
    return;
  }

  if (!map) return;

  setMapStatus('Loading directions...');
  setRouteInfoText('Calculating best route...');

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${DESTINY_LNG},${DESTINY_LAT}?overview=full&geometries=geojson`;

  clearExistingRoute();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  fetch(osrmUrl, { signal: controller.signal })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Routing service network error');
      return response.json();
    })
    .then(data => {
      if (data.code !== 'Ok' || !data.routes || !data.routes.length) {
        throw new Error('No route found');
      }

      const route = data.routes[0];
      const distanceKm = (route.distance / 1000).toFixed(2);
      const durationMin = Math.round(route.duration / 60);

      routeLine = L.polyline(
        route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        {
          color: '#2d4fff',
          weight: 7,
          opacity: 0.9
        }
      ).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

      setMapStatus('Route loaded successfully.');
      setRouteInfoText(`
          <strong>${distanceKm} km • ${durationMin} min</strong>
        `);
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('Route error:', error);

      setMapStatus('Showing Destiny Gardens location.');
      clearExistingRoute();
      map.setView([DESTINY_LAT, DESTINY_LNG], 15);

      if (error.name === 'AbortError') {
        setRouteInfoText('Routing service timed out. Please try again.');
      } else {
        setRouteInfoText('Could not load route. Showing pinned location instead.');
      }
    });
}

function getLocationAndRoute() {
  initMap();
  invalidateMapSoon();

  setMapStatus('Requesting your location...');
  setUserLocationText('Finding your location...');
  setRouteInfoText('Preparing route...');

  if (!navigator.geolocation) {
    setMapStatus('Showing Destiny Gardens location.');
    setUserLocationText('Geolocation is not supported by your browser.');
    setRouteInfoText('Unable to calculate route. Pinned location is still available.');
    map.setView([DESTINY_LAT, DESTINY_LNG], 15);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        setMapStatus('Showing Destiny Gardens location.');
        setUserLocationText('Invalid location data.');
        setRouteInfoText('Unable to calculate route.');
        map.setView([DESTINY_LAT, DESTINY_LNG], 15);
        return;
      }

      setMapStatus('Your location found.');
      setUserLocationText(`Location detected.`);

      updateUserMarker(latitude, longitude, accuracy);
      fetchRoute(latitude, longitude);
    },
    (error) => {
      console.error('Geolocation error:', error);

      let message = 'Unable to get your location.';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Location permission denied.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Location unavailable.';
      } else if (error.code === error.TIMEOUT) {
        message = 'Location request timed out.';
      }

      resetToPinnedLocation();
      setUserLocationText(message);
      setRouteInfoText('Showing pinned Destiny Gardens location instead.');
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

function openDirectionsExperience(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  onUserInteraction(event);

  const mapSection = document.getElementById('map');
  if (mapSection) {
    smoothScrollToElement(mapSection, 1800);
  }

  initMap();

  setTimeout(() => {
    invalidateMapSoon();
    getLocationAndRoute();
  }, 900);
}

// ========== MEDIA HELPERS ==========
function loadVideoSource(video) {
  if (!video) return;

  const source = video.querySelector('source');
  if (!source) return;

  const deferredSrc = source.dataset.src;
  if (deferredSrc && !source.src) {
    source.src = deferredSrc;
    video.load();
  }
}

function playVideo(video) {
  try {
    loadVideoSource(video);
    video.play().catch(() => {});
  } catch (error) {
    /* ignore */
  }
}

function pauseVideo(video) {
  try {
    video.pause();
  } catch (error) {
    /* ignore */
  }
}
// ========== EXPERIENCE SLIDER ==========
function createExperienceSlider(shell) {
  const section = shell.closest('.scene');
  const type = shell.dataset.sliderType || 'activities';

  const track = shell.querySelector('.experience-track');
  const slides = [...shell.querySelectorAll('.experience-slide')];
  const prevBtn = shell.querySelector('.prev-btn');
  const nextBtn = shell.querySelector('.next-btn');
  const currentSpan = shell.querySelector('.current-slide');
  const totalSpan = shell.querySelector('.total-slides');

  let currentIndex = 0;
  let autoTimer = null;
  let sectionIsActive = false;
  let pendingSceneTimeout = null;

  const miniRotatorTimers = new WeakMap();

  const MINI_SCENE_DELAY = type === 'events' ? 3600 : 3900;
  const MINI_SCENE_END_HOLD = type === 'events' ? 1800 : 2000;
  const CARD_REVEAL_DELAY = 600;

  if (totalSpan) totalSpan.textContent = slides.length;

  function clearPendingSceneTimeout() {
    if (pendingSceneTimeout) {
      clearTimeout(pendingSceneTimeout);
      pendingSceneTimeout = null;
    }
  }

  function stopMiniRotators() {
    clearPendingSceneTimeout();

    slides.forEach(slide => {
      slide.classList.remove('scene-card-active');

      const sceneItems = slide.querySelectorAll('.mini-scene');
      sceneItems.forEach(item => {
        item.classList.remove('showing');
        if (item.tagName === 'VIDEO') pauseVideo(item);
      });

      const sceneMedia = slide.querySelector('.scene-media');
      if (sceneMedia && miniRotatorTimers.has(sceneMedia)) {
        clearInterval(miniRotatorTimers.get(sceneMedia));
        miniRotatorTimers.delete(sceneMedia);
      }
    });
  }

  function updateSceneCard(slide, item) {
    const titleEl = slide.querySelector('.scene-title');
    const descriptionEl = slide.querySelector('.scene-description');
    const priceEl = slide.querySelector('.scene-price');

    if (titleEl) titleEl.textContent = item.dataset.title || '';
    if (descriptionEl) descriptionEl.textContent = item.dataset.description || '';
    if (priceEl) priceEl.textContent = item.dataset.price || '';
  }

  function showSceneItem(slide, items, index) {
    items.forEach((item, i) => {
      const active = i === index;
      item.classList.toggle('showing', active);

      if (item.tagName === 'VIDEO') {
        if (active) playVideo(item);
        else pauseVideo(item);
      }
    });

    updateSceneCard(slide, items[index]);
  }

  function startMiniSceneCycle(slide) {
    const items = [...slide.querySelectorAll('.mini-scene')];
    const sceneMedia = slide.querySelector('.scene-media');

    if (!items.length || !sceneMedia) return;

    let sceneIndex = 0;

    pendingSceneTimeout = setTimeout(() => {
      if (!slide.classList.contains('active')) return;
      slide.classList.add('scene-card-active');
    }, CARD_REVEAL_DELAY);

    showSceneItem(slide, items, sceneIndex);

    if (items.length > 1) {
      const timer = setInterval(() => {
        sceneIndex = (sceneIndex + 1) % items.length;
        showSceneItem(slide, items, sceneIndex);
      }, MINI_SCENE_DELAY);

      miniRotatorTimers.set(sceneMedia, timer);
    }
  }

  function render() {
    if (!track || !slides.length) return;

    track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentIndex);
    });

    if (currentSpan) currentSpan.textContent = currentIndex + 1;

    stopMiniRotators();
    startMiniSceneCycle(slides[currentIndex]);
  }

  function getCurrentSlideSceneCount() {
    const currentSlide = slides[currentIndex];
    if (!currentSlide) return 1;
    return Math.max(currentSlide.querySelectorAll('.mini-scene').length, 1);
  }

  function getDelayForCurrentSlide() {
    return (getCurrentSlideSceneCount() * MINI_SCENE_DELAY) + MINI_SCENE_END_HOLD;
  }

  function next(manual = false) {
    currentIndex = (currentIndex + 1) % slides.length;
    render();

    if (manual) onUserInteraction();
  }

  function prev(manual = false) {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    render();

    if (manual) onUserInteraction();
  }

  function scheduleCurrentSlideAdvance() {
    clearTimeout(autoTimer);

    if (!sectionIsActive || state.pausedByUser || !state.guidedEnabled) return;

    autoTimer = setTimeout(() => {
      if (!sectionIsActive || state.pausedByUser || !state.guidedEnabled) return;
      next(false);
      scheduleCurrentSlideAdvance();
    }, getDelayForCurrentSlide());
  }

  function pauseAutoplay() {
    clearTimeout(autoTimer);
    autoTimer = null;
    stopMiniRotators();
  }

  function resumeAutoplay() {
    render();
    scheduleCurrentSlideAdvance();
  }

  function ensureAutoplay() {
    if (sectionIsActive && !autoTimer) {
      resumeAutoplay();
    }
  }

  function setSectionActive(active) {
    sectionIsActive = active;

    if (!active) {
      pauseAutoplay();
    } else {
      ensureAutoplay();
    }
  }

  function getRecommendedSectionDelay() {
    const totalMiniScenes = slides.reduce((sum, slide) => {
      return sum + Math.max(slide.querySelectorAll('.mini-scene').length, 1);
    }, 0);

    return Math.max(
      state.baseSceneDelay,
      (totalMiniScenes * MINI_SCENE_DELAY) + (slides.length * MINI_SCENE_END_HOLD) + 1800
    );
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      prev(true);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      next(true);
    });
  }

  slides.forEach(slide => {
    const btn = slide.querySelector('.open-modal-btn');
    if (btn) {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        openModalFromSlide(slide, type);
        onUserInteraction(event);
      });
    }
  });

  render();

  return {
    section,
    pauseAutoplay,
    resumeAutoplay,
    ensureAutoplay,
    setSectionActive,
    getRecommendedSectionDelay
  };
}

// ========== COUNTDOWNS ==========
function initCountdowns() {
  const countdownEls = [...document.querySelectorAll('[data-countdown]')];
  if (!countdownEls.length) return;

  function updateCountdowns() {
    const now = Date.now();

    countdownEls.forEach(el => {
      const target = new Date(el.dataset.countdown).getTime();
      if (Number.isNaN(target)) return;

      const diff = target - now;

      if (diff <= 0) {
        el.textContent = 'Happening now';
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);

      el.textContent =
        `Starts in ${String(days).padStart(2, '0')}d ` +
        `${String(hours).padStart(2, '0')}h ` +
        `${String(mins).padStart(2, '0')}m`;
    });
  }

  updateCountdowns();
  setInterval(updateCountdowns, 60000);
}

// ========== MODAL ==========
function openModalFromSlide(slide, type = 'activities') {
  if (!modal || !modalMedia || !modalTitle || !modalDescription || !modalPrice || !modalTag) return;

  const scenes = [...slide.querySelectorAll('.mini-scene')];
  const mainTitle = slide.querySelector('.experience-intro h3')?.textContent || 'Experience';
  const activeScene = slide.querySelector('.mini-scene.showing') || scenes[0];

  modalTitle.textContent = activeScene?.dataset.title || mainTitle;
  modalDescription.textContent = activeScene?.dataset.description || '';
  modalPrice.textContent = activeScene?.dataset.price || 'Contact us';
  modalTag.textContent = type === 'events' ? 'Event Preview' : 'Activity Preview';

  modalMedia.innerHTML = `
    <div class="modal-media-viewer">
      <div class="modal-main-preview" id="modalMainPreview"></div>
      <div class="modal-thumb-strip" id="modalThumbStrip"></div>
    </div>
  `;

  const modalMainPreview = document.getElementById('modalMainPreview');
  const modalThumbStrip = document.getElementById('modalThumbStrip');

  function renderMainMedia(scene) {
    modalMainPreview.innerHTML = '';

    modalTitle.textContent = scene?.dataset.title || mainTitle;
    modalDescription.textContent = scene?.dataset.description || '';
    modalPrice.textContent = scene?.dataset.price || 'Contact us';

    if (scene.tagName === 'VIDEO') {
      const video = document.createElement('video');
      const source = scene.querySelector('source');

      video.src = scene.currentSrc || source?.src || '';
      video.controls = true;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.className = 'modal-fit-media';

      modalMainPreview.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = scene.src;
      img.alt = scene.dataset.title || mainTitle;
      img.className = 'modal-fit-media';

      modalMainPreview.appendChild(img);
    }

    [...modalThumbStrip.children].forEach((thumb, index) => {
      thumb.classList.toggle('active', scenes[index] === scene);
    });
  }

  scenes.forEach((scene, index) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'modal-thumb';
    thumb.setAttribute('aria-label', scene.dataset.title || `Preview ${index + 1}`);

    if (scene.tagName === 'VIDEO') {
      const video = document.createElement('video');
      const source = scene.querySelector('source');

      video.src = scene.currentSrc || source?.src || '';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.className = 'modal-thumb-media';

      thumb.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = scene.src;
      img.alt = scene.dataset.title || `Preview ${index + 1}`;
      img.className = 'modal-thumb-media';

      thumb.appendChild(img);
    }

    thumb.addEventListener('click', () => {
      renderMainMedia(scene);
    });

    modalThumbStrip.appendChild(thumb);
  });

  renderMainMedia(activeScene);
  modal.classList.add('show');
}

function openMemoryModal(card) {
  if (!modal || !modalMedia || !modalTitle || !modalDescription || !modalPrice || !modalTag) return;

  modalTitle.textContent = card.dataset.title || 'Memory';
  modalDescription.textContent = card.dataset.description || '';
  modalPrice.textContent = card.dataset.price || 'On request';
  modalTag.textContent = 'Past Experience';
  modalMedia.innerHTML = '';

  if (card.dataset.type === 'video') {
    const video = document.createElement('video');
    video.src = card.dataset.src || '';
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    modalMedia.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = card.dataset.src || '';
    img.alt = card.dataset.title || 'Memory';
    modalMedia.appendChild(img);
  }

  modal.classList.add('show');
}

function closeModal() {
  if (!modal || !modalMedia) return;
  modal.classList.remove('show');
  modalMedia.innerHTML = '';
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    closeModal();
  });
}

if (modalCloseBtn2) {
  modalCloseBtn2.addEventListener('click', (event) => {
    event.stopPropagation();
    closeModal();
  });
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
}

// ========== MEMORIES ==========
document.querySelectorAll('.open-memory').forEach(card => {
  card.addEventListener('click', (event) => {
    event.stopPropagation();
    openMemoryModal(card);
    onUserInteraction(event);
  });
});

// ========== FADE UPS ==========
function initFadeUps() {
  const fadeEls = document.querySelectorAll('.fade-up');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  });

  fadeEls.forEach(el => observer.observe(el));
}

// ========== CONTROLS ==========
if (toggleTourBtn) {
  toggleTourBtn.addEventListener('click', (event) => {
    event.stopPropagation();

    state.pausedByUser = !state.pausedByUser;

    if (state.pausedByUser) {
      clearTimeout(state.sceneTimer);
      clearTimeout(state.resumeTimer);
      stopAnimatedScroll();
      state.sliders.forEach(slider => slider.pauseAutoplay());
      setTourStatus(false, 'Tour paused manually');
      return;
    }

    setTourStatus(true, 'Guided tour resumed');

    const currentIndex = getMostVisibleSectionIndex();
    state.currentSection = currentIndex;
    updateProgressDots();
    applyThemeBySection(sections[currentIndex]?.id);

    const currentSection = getCurrentVisibleSection();
    state.sliders.forEach(slider => {
      const active = slider.section === currentSection;
      slider.setSectionActive(active);
      if (active) slider.ensureAutoplay();
    });

    scheduleNextScene();
  });
}

if (restartTourBtn) {
  restartTourBtn.addEventListener('click', (event) => {
    event.stopPropagation();

    state.pausedByUser = false;
    state.guidedEnabled = true;

    clearTimeout(state.sceneTimer);
    clearTimeout(state.resumeTimer);
    stopAnimatedScroll();

    setTourStatus(true, 'Tour restarted');
    scrollToSection(0);

    setTimeout(() => {
      state.currentSection = 0;
      updateProgressDots();
      applyThemeBySection('hero');

      const currentSection = getCurrentVisibleSection();
      state.sliders.forEach(slider => {
        const active = slider.section === currentSection;
        slider.setSectionActive(active);
        if (active) slider.ensureAutoplay();
      });

      scheduleNextScene();
    }, 700);
  });
}

if (exploreFreeBtn) {
  exploreFreeBtn.addEventListener('click', (event) => {
    event.stopPropagation();

    state.guidedEnabled = false;
    state.pausedByUser = true;
    clearTimeout(state.sceneTimer);
    clearTimeout(state.resumeTimer);
    stopAnimatedScroll();
    state.sliders.forEach(slider => slider.pauseAutoplay());
    setTourStatus(false, 'Explore freely — no auto scroll');
  });
}

if (getDirectionsBtn) {
  getDirectionsBtn.addEventListener('click', openDirectionsExperience);
}

if (useMyLocationBtn) {
  useMyLocationBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onUserInteraction(event);
    getLocationAndRoute();
  });
}

// ========== SCROLL / INPUT ==========
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      syncVisibleSection();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

['wheel', 'touchstart', 'keydown'].forEach(eventName => {
  window.addEventListener(eventName, onUserInteraction, { passive: true });
});

if (main) {
  main.addEventListener('pointerdown', onUserInteraction, { passive: true });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  buildProgressDots();
  initFadeUps();
  initCountdowns();

  state.sliders = [...document.querySelectorAll('[data-slider]')].map(createExperienceSlider);

  syncVisibleSection();
  applyThemeBySection(getCurrentVisibleSection()?.id || 'hero');

  const currentSection = getCurrentVisibleSection();
  state.sliders.forEach(slider => {
    slider.setSectionActive(slider.section === currentSection);
  });

  initMap();
  setTourStatus(true, 'Guided tour active');
  scheduleNextScene();
});
/**
 * E-PORTFOLIO SEMINAR PPG CALON GURU 2026
 * Fadilatul Fajri, S.Pd. - Universitas Muhammadiyah Purwokerto
 * Interactive Navigation & Presentation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  const slides = Array.from(document.querySelectorAll('.slide-section'));
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isPresentationMode = true; // Default presentation mode for seminar elegance

  // DOM Elements
  const progressBar = document.getElementById('progressBarFill');
  const slideCounter = document.getElementById('slideCounter');
  const floatingNav = document.getElementById('floatingNav');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const quickJumpSelect = document.getElementById('quickJumpSelect');
  const modalBackdrop = document.getElementById('artifactModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalTopicTag = document.getElementById('modalTopicTag');
  const modalDesc = document.getElementById('modalDesc');
  const modalOpenBtn = document.getElementById('modalOpenBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Initialize display
  function init() {
    // Set initial mode
    if (isPresentationMode) {
      document.body.classList.add('mode-presentation');
    } else {
      document.body.classList.remove('mode-presentation');
    }

    // Check hash URL or default to 0
    const hash = window.location.hash;
    if (hash) {
      const targetSlide = slides.findIndex(s => '#' + s.id === hash);
      if (targetSlide !== -1) {
        currentSlide = targetSlide;
      }
    }

    updateSlideView(currentSlide, false);
    setupEventListeners();
  }

  // Update slide view
  function updateSlideView(index, updateHistory = true) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlide = index;

    // Update active slide class
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
        if (!isPresentationMode) {
          slide.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        slide.classList.remove('active');
      }
    });

    // Update URL hash
    const currentId = slides[currentSlide].id;
    if (updateHistory && history.pushState) {
      history.pushState(null, null, '#' + currentId);
    }

    // Update Progress Bar
    const progressPercent = ((currentSlide + 1) / totalSlides) * 100;
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    // Update Slide Counter HUD (e.g. 05 / 14)
    if (slideCounter) {
      const currentFormatted = String(currentSlide + 1).padStart(2, '0');
      const totalFormatted = String(totalSlides).padStart(2, '0');
      slideCounter.textContent = `${currentFormatted} / ${totalFormatted}`;
    }

    // Update Quick Jump Select if present
    if (quickJumpSelect) {
      quickJumpSelect.value = currentSlide;
    }

    // Update Floating Nav active state
    updateFloatingNavHighlight(currentId);

    // Window scroll reset in presentation mode
    if (isPresentationMode) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  // Highlight floating nav button based on current slide
  function updateFloatingNavHighlight(slideId) {
    const navLinks = document.querySelectorAll('.floating-nav-btn[data-target]');
    navLinks.forEach(link => {
      const target = link.getAttribute('data-target');
      if (
        (target === 'cover' && slideId === 'cover') ||
        (target === 'menu' && slideId === 'menu-utama') ||
        (target === 'profil' && slideId === 'profil') ||
        (target === 'refleksi' && slideId.startsWith('topik')) ||
        (target === 'refleksi' && slideId === 'refleksi-overview') ||
        (target === 'sintesis' && slideId === 'sintesis') ||
        (target === 'kontak' && (slideId === 'kontak' || slideId === 'closing'))
      ) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Next / Previous
  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      updateSlideView(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      updateSlideView(currentSlide - 1);
    }
  }

  // Jump to specific slide by ID or Index
  window.goToSlide = function(target) {
    if (typeof target === 'number') {
      updateSlideView(target);
    } else if (typeof target === 'string') {
      const idx = slides.findIndex(s => s.id === target || '#' + s.id === target);
      if (idx !== -1) {
        updateSlideView(idx);
      }
    }
  };

  // Toggle Presentation Mode vs Continuous Scroll Mode
  function toggleMode() {
    isPresentationMode = !isPresentationMode;
    if (isPresentationMode) {
      document.body.classList.add('mode-presentation');
      if (modeToggleBtn) {
        modeToggleBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          <span class="hidden sm:inline">Mode Slide</span>
        `;
      }
      updateSlideView(currentSlide);
    } else {
      document.body.classList.remove('mode-presentation');
      if (modeToggleBtn) {
        modeToggleBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          <span class="hidden sm:inline">Mode Web</span>
        `;
      }
      // Scroll to current slide in web view
      slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Toggle Fullscreen
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Modal Artifact Helper
  window.openArtifactModal = function(topicTitle, topicTag, description, driveUrl) {
    if (!modalBackdrop) {
      window.open(driveUrl, '_blank');
      return;
    }
    modalTitle.textContent = topicTitle;
    modalTopicTag.textContent = topicTag;
    modalDesc.textContent = description;
    modalOpenBtn.href = driveUrl;
    modalBackdrop.classList.add('active');
  };

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't trigger if modal is open except Escape
      if (modalBackdrop && modalBackdrop.classList.contains('active')) {
        if (e.key === 'Escape') closeModal();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          updateSlideView(0);
          break;
        case 'End':
          e.preventDefault();
          updateSlideView(totalSlides - 1);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMode();
          break;
        case 'Escape':
          closeModal();
          break;
      }
    });

    // Button Clicks
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (modeToggleBtn) modeToggleBtn.addEventListener('click', toggleMode);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

    if (quickJumpSelect) {
      quickJumpSelect.addEventListener('change', (e) => {
        updateSlideView(parseInt(e.target.value, 10));
      });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    // Touch Swipe Gestures for Tablets / Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;
      // Only horizontal swipe if not scrolling vertically significantly
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 60) {
        if (diffX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      const targetSlide = slides.findIndex(s => '#' + s.id === hash);
      if (targetSlide !== -1 && targetSlide !== currentSlide) {
        updateSlideView(targetSlide, false);
      }
    });

    // In continuous scroll mode, update active floating nav on scroll
    window.addEventListener('scroll', () => {
      if (!isPresentationMode) {
        const scrollPosition = window.scrollY + window.innerHeight / 3;
        slides.forEach((slide, idx) => {
          const top = slide.offsetTop;
          const height = slide.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSlide = idx;
            if (slideCounter) {
              const currentFormatted = String(idx + 1).padStart(2, '0');
              const totalFormatted = String(totalSlides).padStart(2, '0');
              slideCounter.textContent = `${currentFormatted} / ${totalFormatted}`;
            }
            if (progressBar) {
              const progressPercent = ((idx + 1) / totalSlides) * 100;
              progressBar.style.width = `${progressPercent}%`;
            }
            updateFloatingNavHighlight(slide.id);
          }
        });
      }
    });
  }

  // Run initialization
  init();
});

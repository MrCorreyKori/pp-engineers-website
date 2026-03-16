// Shared layout script for P & P Engineers static site

function toggleMenu() {
  const nav = document.getElementById('nav-links');
  if (nav) {
    nav.classList.toggle('active');
  }
}

function getComponentsBasePath() {
  try {
    var path = window.location.pathname || '/';
    if (!path) return '';
    // Remove trailing slash (except for root)
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    var segments = path.split('/').filter(Boolean);
    // Each segment represents a level of depth from site root
    var depth = segments.length;
    var prefix = '';
    for (var i = 0; i < depth; i++) {
      prefix += '../';
    }
    return prefix;
  } catch (e) {
    console.error('Error computing components base path', e);
    return '';
  }
}

function loadLayoutComponent(targetId, fileName) {
  var el = document.getElementById(targetId);
  if (!el) return;

  var base = getComponentsBasePath();
  var url = base + 'components/' + fileName;

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load ' + url);
      }
      return response.text();
    })
    .then(function (html) {
      el.innerHTML = html;

      if (targetId === 'header') {
        // Allow layout to settle before measuring
        setTimeout(updateHeaderLayoutMetrics, 200);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function updateHeaderLayoutMetrics() {
  try {
    var headerEl = document.getElementById('header');
    if (!headerEl) return;

    var headerHeight = headerEl.offsetHeight || 0;
    var root = document.documentElement;

    root.style.setProperty('--header-height', headerHeight + 'px');
    root.style.setProperty('--nav-top-offset', headerHeight + 30 + 'px');
  } catch (e) {
    console.error('Error updating header layout metrics', e);
  }
}

function initSmoothScrolling() {
  try {
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  } catch (e) {
    console.error('Error initializing smooth scrolling', e);
  }
}

function initLazyImages() {
  try {
    if ('loading' in HTMLImageElement.prototype) {
      var images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(function (img) {
        img.loading = 'lazy';
      });
    }
  } catch (e) {
    console.error('Error initializing lazy images', e);
  }
}

function initLayout() {
  document.addEventListener('DOMContentLoaded', function () {
    loadLayoutComponent('header', 'header.html');
    loadLayoutComponent('footer', 'footer.html');

    initSmoothScrolling();
    initLazyImages();

    window.addEventListener('resize', function () {
      updateHeaderLayoutMetrics();
    });
  });
}

// Auto-init when script is loaded
initLayout();


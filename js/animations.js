/* animations.js — GSAP ScrollTrigger animations */
'use strict';

(function () {

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP not loaded — animations skipped');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Reveal-up elements ──────────────────────────────────── */
    if (!prefersReduced) {
      gsap.utils.toArray('.reveal-up').forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 28, filter: 'blur(3px)' },
          {
            opacity: 1, y: 0, filter: 'blur(0px)',
            duration: 0.75,
            delay: (i % 4) * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            }
          }
        );
      });
    } else {
      /* Instant reveals for reduced motion */
      document.querySelectorAll('.reveal-up').forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
    }

    /* ── Hero entrance (stagger on load) ────────────────────── */
    if (!prefersReduced) {
      const heroEls = document.querySelectorAll('.section-hero .reveal-up');
      gsap.fromTo(heroEls,
        { opacity: 0, y: 28, filter: 'blur(3px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2,
        }
      );
    }

    /* ── Proof strip count-up ───────────────────────────────── */
    const proofNumbers = document.querySelectorAll('.proof-number');

    proofNumbers.forEach(el => {
      const target  = parseInt(el.dataset.target) || 0;
      const prefix  = el.dataset.prefix  || '';
      const suffix  = el.dataset.suffix  || '';
      const obj     = { val: 0 };
      const origText = el.textContent;

      if (prefersReduced) return; /* Keep static text */

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = prefix + Math.round(obj.val) + suffix;
            },
            onComplete: () => {
              el.textContent = origText;
            },
          });
        }
      });
    });

    /* ── Project atmosphere shifts ──────────────────────────── */
    document.querySelectorAll('.section-project').forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => section.classList.add('atmosphere-active'),
        onLeave: () => section.classList.remove('atmosphere-active'),
        onEnterBack: () => section.classList.add('atmosphere-active'),
        onLeaveBack: () => section.classList.remove('atmosphere-active'),
      });
    });

    /* ── Project device parallax on desktop ─────────────────── */
    if (!window.SceneState?.isMobile && !prefersReduced) {
      document.querySelectorAll('.section-project .project-right').forEach(right => {
        gsap.fromTo(right,
          { y: 20 },
          {
            y: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: right.closest('.section-project'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            }
          }
        );
      });
    }

    /* ── Timeline line draw (desktop) ───────────────────────── */
    const timelineSection = document.getElementById('timeline-desktop');
    if (timelineSection && !prefersReduced) {
      const fill = document.getElementById('timeline-line-fill');
      const dots = document.querySelectorAll('.timeline-dot');
      const deployed = document.getElementById('timeline-deployed');

      ScrollTrigger.create({
        trigger: timelineSection,
        start: 'top 70%',
        end: 'top 20%',
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          if (fill) fill.style.width = (progress * 100) + '%';

          /* Light up dots progressively */
          dots.forEach((dot, i) => {
            const threshold = (i + 0.5) / dots.length;
            dot.classList.toggle('lit', progress >= threshold);
          });

          /* Show DEPLOYED label when complete */
          if (deployed) {
            deployed.classList.toggle('visible', progress >= 0.98);
          }

          /* Spark particles at the fill head */
          if (window.Scene?.emitSparks && fill) {
            const fillRect = fill.getBoundingClientRect();
            const railRect = fill.parentElement.getBoundingClientRect();
            const headX = railRect.left + railRect.width * progress;
            const headY = railRect.top + railRect.height / 2;

            /* Convert to world coords for Three.js */
            const ndcX = (headX / window.innerWidth)  * 2 - 1;
            const ndcY = -(headY / window.innerHeight) * 2 + 1;
            const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
            vec.unproject(window.Scene.camera);
            vec.sub(window.Scene.camera.position).normalize();
            const dist = -window.Scene.camera.position.z / vec.z;
            const wp   = window.Scene.camera.position.clone().addScaledVector(vec, dist);
            window.Scene.emitSparks(wp.x, wp.y);
          }
        }
      });
    }

    /* Mobile timeline: vertical fill on scroll */
    const mobileRail = document.getElementById('timeline-mobile-fill');
    if (mobileRail && !prefersReduced) {
      ScrollTrigger.create({
        trigger: '#timeline-mobile',
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: 1,
        onUpdate: (self) => {
          mobileRail.style.height = (self.progress * 100) + '%';
        }
      });
    }

    /* ── Device mouse parallax (DOM only, desktop) ──────────── */
    if (!window.SceneState?.isMobile) {
      const devices = document.getElementById('hero-devices');
      if (devices) {
        document.addEventListener('mousemove', e => {
          const x = (e.clientX / window.innerWidth  - 0.5) * -6;
          const y = (e.clientY / window.innerHeight - 0.5) * -4;
          gsap.to(devices, { x, y, duration: 0.8, ease: 'power1.out' });
        });
      }
    }

    /* ── Mobile demo autoplay (IntersectionObserver) ────────── */
    const demoEls = document.querySelectorAll('.tile-demo');
    const demoObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && window.SceneState?.isMobile) {
          entry.target.classList.add('demo-autoplay');
        }
      });
    }, { threshold: 0.5 });

    demoEls.forEach(el => demoObs.observe(el));

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    /* GSAP needs a tick so defer slightly */
    setTimeout(init, 0);
  }

})();

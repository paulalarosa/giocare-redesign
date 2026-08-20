(function () {
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduce) {
        document.documentElement.classList.add('gsap-pending');
        setTimeout(function () {
          if (!window.__gsapReady) document.documentElement.classList.remove('gsap-pending');
        }, 3000);
      }
    })();

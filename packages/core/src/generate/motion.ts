import type { MonetreadySpec } from "../schema/monetready-spec.js";
import { resolveFirebaseMeasurementId } from "../integrations/firebase-analytics.js";
import { resolvePostHogHost, resolvePostHogKey } from "../integrations/posthog.js";

export function analyticsScript(spec: MonetreadySpec): string {
  switch (spec.integrations.analytics) {
    case "firebase": {
      const measurementId = resolveFirebaseMeasurementId();
      if (!measurementId) {
        return `<!-- Firebase Analytics: set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID to enable -->`;
      }

      return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    </script>`;
    }
    case "posthog": {
      const key = resolvePostHogKey();
      const host = resolvePostHogHost();
      if (!key) {
        return `<!-- PostHog: set POSTHOG_API_KEY to enable analytics on generated pages -->`;
      }

      return `
    <script>
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('${key}', { api_host: '${host}' });
    </script>`;
    }
    case "plausible":
      return `
    <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>`;
    case "mixpanel":
      return `<!-- Mixpanel: add your mixpanel snippet or set MIXPANEL_TOKEN -->`;
    case "none":
      return "";
    default: {
      const _exhaustive: never = spec.integrations.analytics;
      return `<!-- Unsupported analytics provider: ${String(_exhaustive)} -->`;
    }
  }
}

export function fontLinks(): string {
  return `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">`;
}

export function motionScript(): string {
  return `
  <script>
    (function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var nav = document.querySelector(".site-nav");
      if (nav) {
        window.addEventListener("scroll", function () {
          nav.classList.toggle("scrolled", window.scrollY > 24);
        }, { passive: true });
      }
      if (!reduce) {
        var reveals = document.querySelectorAll(".reveal");
        if (reveals.length && "IntersectionObserver" in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) {
                e.target.classList.add("visible");
                io.unobserve(e.target);
              }
            });
          }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
          reveals.forEach(function (el, i) {
            el.style.transitionDelay = Math.min(i * 0.08, 0.4) + "s";
            io.observe(el);
          });
        } else {
          reveals.forEach(function (el) { el.classList.add("visible"); });
        }
        document.querySelectorAll("[data-count]").forEach(function (el) {
          var target = parseInt(el.getAttribute("data-count") || "0", 10);
          var suffix = el.getAttribute("data-suffix") || "";
          var start = 0;
          var duration = 1200;
          var startTime = null;
          function step(ts) {
            if (!startTime) startTime = ts;
            var p = Math.min((ts - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(start + (target - start) * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          var counterIo = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
              requestAnimationFrame(step);
              counterIo.disconnect();
            }
          }, { threshold: 0.5 });
          counterIo.observe(el);
        });
      } else {
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
      }
      document.querySelectorAll(".faq-item").forEach(function (item) {
        var btn = item.querySelector(".faq-q");
        if (!btn) return;
        btn.addEventListener("click", function () {
          var open = item.classList.contains("open");
          document.querySelectorAll(".faq-item.open").forEach(function (o) { o.classList.remove("open"); });
          if (!open) item.classList.add("open");
        });
      });
    })();
  </script>`;
}

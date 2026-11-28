'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Robust client environment detector
 */
function detectEnvironment() {
  if (typeof window === 'undefined') return {};

  const ua = navigator.userAgent || '';
  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let deviceType = 'Desktop';
  let deviceModel = 'PC / Desktop';

  // Device detection
  const isTablet = /(iPad|Tablet|(Android(?!.*Mobile))|(Windows(?!.*Phone)(.*Touch))|Kindle|PlayBook)/i.test(ua);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  if (isTablet) {
    deviceType = 'Tablet';
    deviceModel = /iPad/i.test(ua) ? 'Apple iPad' : 'Tablet Device';
  } else if (isMobile || ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 1 && window.innerWidth < 768)) {
    deviceType = 'Mobile';
    if (/iPhone/i.test(ua)) deviceModel = 'Apple iPhone';
    else if (/Samsung/i.test(ua) || /SM-/i.test(ua)) deviceModel = 'Samsung Galaxy';
    else if (/Pixel/i.test(ua)) deviceModel = 'Google Pixel';
    else if (/Xiaomi|Redmi/i.test(ua)) deviceModel = 'Xiaomi Device';
    else deviceModel = 'Smartphone';
  } else {
    deviceType = 'Desktop';
    if (/Macintosh/i.test(ua)) deviceModel = 'Apple Macintosh';
    else if (/Windows/i.test(ua)) deviceModel = 'Windows PC';
    else if (/Linux/i.test(ua)) deviceModel = 'Linux Workstation';
  }

  // OS detection
  if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (/Windows NT 6.3/i.test(ua)) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6.1/i.test(ua)) {
    os = 'Windows';
    osVersion = '7';
  } else if (/Mac OS X/i.test(ua)) {
    os = 'macOS';
    const match = ua.match(/Mac OS X ([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iPhone/i.test(ua)) {
    os = 'iOS';
    const match = ua.match(/OS ([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iPad/i.test(ua)) {
    os = 'iPadOS';
    const match = ua.match(/OS ([0-9_]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android ([0-9.]+)/i);
    if (match) osVersion = match[1];
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  } else if (/CrOS/i.test(ua)) {
    os = 'Chrome OS';
  }

  // Browser detection
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
    const match = ua.match(/Edg\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
    browser = 'Opera';
    const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/SamsungBrowser\//i.test(ua)) {
    browser = 'Samsung Internet';
    const match = ua.match(/SamsungBrowser\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/Chrome\//i.test(ua)) {
    browser = 'Google Chrome';
    const match = ua.match(/Chrome\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
    const match = ua.match(/Version\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
    const match = ua.match(/Firefox\/([0-9.]+)/i);
    if (match) browserVersion = match[1];
  }

  const screenResolution = `${window.screen?.width || 0} × ${window.screen?.height || 0}`;
  const viewport = `${window.innerWidth} × ${window.innerHeight}`;
  const language = navigator.language || (navigator as any).userLanguage || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const platform = navigator.platform || 'Unknown';

  return {
    userAgent: ua,
    browser,
    browserVersion,
    os,
    osVersion,
    deviceType,
    deviceModel,
    screenResolution,
    viewport,
    language,
    timezone,
    platform,
  };
}

export function WebsiteVisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePageViewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Retrieve or create persistent visitor ID
  const getVisitorId = () => {
    try {
      let id = localStorage.getItem('fw_visitor_id');
      if (!id) {
        id = 'vis_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
        localStorage.setItem('fw_visitor_id', id);
        document.cookie = `fw_visitor_id=${id}; path=/; max-age=31536000; SameSite=Lax`;
      }
      return id;
    } catch (e) {
      return 'vis_anon_' + Date.now().toString(36);
    }
  };

  const sendDurationPing = (pageViewId: string, visitorId: string, durationSec: number) => {
    if (!pageViewId || durationSec < 1) return;

    const payload = JSON.stringify({
      pageViewId,
      visitorId,
      duration: durationSec,
    });

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/track/duration', blob);
      } else {
        fetch('/api/track/duration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Exclude admin pages from public visitor stats so dashboard maintenance doesn't pollute data
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/admin-login')) {
      return;
    }

    const visitorId = getVisitorId();
    const env = detectEnvironment();

    // 1. If switching from a previous page, finalize its duration
    if (activePageViewIdRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      sendDurationPing(activePageViewIdRef.current, visitorId, elapsed);
    }

    // 2. Reset time
    startTimeRef.current = Date.now();
    activePageViewIdRef.current = null;

    // 3. Register the new page view with authentic user details if logged in
    const referrer = typeof document !== 'undefined' ? (document.referrer || 'Direct / Bookmark') : 'Direct / Bookmark';
    const queryStr = searchParams?.toString();
    const fullPath = queryStr ? `${pathname}?${queryStr}` : (pathname || '/');

    let userDetails: { userId?: string; userName?: string; userEmail?: string; userRole?: string } = {};
    try {
      const raw = localStorage.getItem('findworker_auth_session');
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.id || u?.email) {
          userDetails = {
            userId: u.id,
            userName: u.name,
            userEmail: u.email,
            userRole: u.role,
          };
        }
      }
    } catch (e) {}

    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        path: fullPath,
        title: typeof document !== 'undefined' ? (document.title || fullPath) : fullPath,
        referrer,
        ...env,
        ...userDetails,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.pageViewId) {
          activePageViewIdRef.current = data.data.pageViewId;
          if (data?.data?.visitorId) {
            try {
              localStorage.setItem('fw_visitor_id', data.data.visitorId);
              document.cookie = `fw_visitor_id=${data.data.visitorId}; path=/; max-age=31536000; SameSite=Lax`;
            } catch (e) {}
          }
        }
      })
      .catch(() => {});

    // 4. Periodic heartbeat ping (every 15 seconds) to ensure real-time accuracy
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (activePageViewIdRef.current && document.visibilityState === 'visible') {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        sendDurationPing(activePageViewIdRef.current, visitorId, elapsed);
      }
    }, 15000);

    // 5. Finalize duration on page unload / hide
    const handleUnloadOrHide = () => {
      if (activePageViewIdRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        sendDurationPing(activePageViewIdRef.current, visitorId, elapsed);
      }
    };

    window.addEventListener('beforeunload', handleUnloadOrHide);
    window.addEventListener('pagehide', handleUnloadOrHide);
    document.addEventListener('visibilitychange', handleUnloadOrHide);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.removeEventListener('beforeunload', handleUnloadOrHide);
      window.removeEventListener('pagehide', handleUnloadOrHide);
      document.removeEventListener('visibilitychange', handleUnloadOrHide);

      if (activePageViewIdRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        sendDurationPing(activePageViewIdRef.current, visitorId, elapsed);
      }
    };
  }, [pathname, searchParams]);

  return null;
}

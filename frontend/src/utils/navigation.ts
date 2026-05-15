export function redirectToUrl(url: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
      return;
    }
  } catch {
    // Fall back to the current browsing context when top navigation is blocked.
  }

  window.location.assign(url);
}
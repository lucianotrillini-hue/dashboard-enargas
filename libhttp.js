// lib/http.js
export async function fetchText(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; DashboardENARGAS/1.0)",
      ...(init.headers || {}),
    },
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al pedir ${url}`);
  }

  return res.text();
}

export async function fetchBuffer(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; DashboardENARGAS/1.0)",
      ...(init.headers || {}),
    },
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al pedir ${url}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
``
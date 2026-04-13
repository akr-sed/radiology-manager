export default async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("access_token");

  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return response;
  }

  return response;
}

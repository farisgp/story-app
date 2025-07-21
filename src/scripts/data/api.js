// import { getAccessToken } from '../utils/auth';
import CONFIG from '../config';
import { getToken, setToken } from '../pages/auth/auth'

const ENDPOINTS = {
  // Auth
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Story
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  // Notifications
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();
  if (!json.error) {
    setToken(json.loginResult.token);
  }

  return json;
}

export async function addStory({
  description,
  photo,
  lat = null,
  lon = null,
  token = null,
}) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat !== null) formData.append("lat", lat);
  if (lon !== null) formData.append("lon", lon);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const storedToken = getToken();
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  const endpoint = token ? ENDPOINTS.ADD_STORY : ENDPOINTS.ADD_STORY_GUEST;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: headers,
    body: formData,
  });
  return response.json();
}

export async function getAllStories({
  page = 1,
  size = 10,
  location = 0,
  token = null,
}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  params.append("location", location);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const storedToken = getToken();
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(
    `${ENDPOINTS.GET_ALL_STORIES}?${params.toString()}`,
    {
      method: "GET",
      headers: headers,
    }
  );
  return response.json();
}

export async function getDetailStory(id, token = null) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    const storedToken = getToken();
    if (storedToken) {
      headers["Authorization"] = `Bearer ${storedToken}`;
    }
  }

  const response = await fetch(ENDPOINTS.GET_DETAIL_STORY(id), {
    method: "GET",
    headers: headers,
  });
  return response.json();
}
export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
  const accessToken = getToken();
  const data = JSON.stringify({
    endpoint,
    keys: { p256dh, auth },
  });
 
  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
 
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
 
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getToken();
  const data = JSON.stringify({ endpoint });

  try {
    const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: data,
    });

    const json = await fetchResponse.json();

    if (!fetchResponse.ok) {
      console.error("Unsubscribe API error:", json);
      return {
        ok: false,
        error: json.message || "Unsubscribe failed on server.",
      };
    }

    return {
      ...json,
      ok: true,
    };
  } catch (error) {
    console.error("unsubscribePushNotification: fetch error:", error);
    return {
      ok: false,
      error: error.message || "Network error during unsubscribe.",
    };
  }
}

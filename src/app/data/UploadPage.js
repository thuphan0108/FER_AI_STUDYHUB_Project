const API_URL = 'https://6a41389f1ff1d27becc15c4a.mockapi.io/FER';

async function request(endpoint = '', options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export function getDocuments() {
  return request();
}

export function addDocument(document) {
  return request('', {
    method: 'POST',
    body: JSON.stringify(document),
  });
}

export function deleteDocument(id) {
  return request(`/${id}`, {
    method: 'DELETE',
  });
}

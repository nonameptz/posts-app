const BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function getPosts() {
  const res = await fetch(`${BASE_URL}/posts`, {
    cache: 'force-cache'
  });
  return res.json();
}

export async function getPost(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`);
  return res.json();
}

export async function createPost(post) {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  return res.json();
}

export async function updatePost(id, post) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export function getUsers() {
  return fetch(`${BASE_URL}/users`, {
    cache: 'force-cache'
  })
    .then((r) => r.json())
}

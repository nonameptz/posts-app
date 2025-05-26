# Posts App

A Vue.js application for managing posts with search, bulk actions, and user management functionality.

## Demo

Try the live demo: [https://nonameptz.github.io/posts-app/](https://nonameptz.github.io/posts-app/)

## Features

- Display posts with authors
- Search through posts and authors
- Bulk selection and deletion
- Post management (create, edit, delete)
- Responsive design

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/nonameptz/posts-app.git
cd posts-app
npm install
```

## Development

Start local development server:

```bash
npm run dev
```

## Production

Build for production:

```bash
npm run build
```

## Testing

Run end-to-end tests:

```bash
npm run test:e2e
```

## Technology Stack
- Vue 3
- Tailwind CSS
- JSONPlaceholder API

## API Integration

The app uses JSONPlaceholder for demo data:

- Posts: GET /posts
- Users: GET /users
- Single post: GET /posts/:id
- Create post: POST /posts
- Update post: PUT /posts/:id
- Delete post: DELETE /posts/:id

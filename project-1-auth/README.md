# Mini Project 1: User Authentication

Standalone Express API for user registration and login. User documents are
stored in the `mini` database's `Mini project 1` collection. Passwords are
hashed with bcrypt; successful registration and login return a JWT.

## Start

```sh
cp .env.example .env
npm install
npm start
```

Fill in the values in `.env`, including a strong, private `JWT_SECRET`, before
starting the server. `npm start` builds the React frontend and serves the app
and API together at http://localhost:3001. Never commit the `.env` file.

## Endpoints

- `POST /api/auth/register` — JSON `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login` — JSON `{ "email": "...", "password": "..." }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`
- `GET /api/health`

The frontend source is in `client/`; run `npm run build` to rebuild it
independently.

# CollabSphere Mini Projects

Three independent Node.js/React applications live in separate folders. Each
connects to the same MongoDB database, `mini`, and writes to its own collection:

| Application | Folder | MongoDB collection | Default URL |
| --- | --- | --- | --- |
| User Authentication | `project-1-auth/` | `Mini project 1` | http://localhost:3001 |
| Collaborative Markdown Notes | `project-2-notes/` | `Mini project 2` | http://localhost:3002 |
| Gemini README Generator | `project-3-readme/` | `Mini project 3` | http://localhost:3003 |

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string
- A Gemini API key for Project 3

The applications select the `mini` database even if the MongoDB URI points to a
different default database. They create their collections when the first record
is saved; there is no need to create the collections manually.

## Run an application

Fill in the `.env` file in each project folder, then install and start that app.
`npm start` builds the React frontend and starts the API/server together:

```sh
cd project-1-auth
cp .env.example .env
npm start
```

Repeat in `project-2-notes/` and `project-3-readme/`. Each app uses its own
`package.json` and can run independently. Project 3 also needs `GEMINI_API_KEY`
set in its `.env`. To rebuild a frontend without starting the server, run
`npm run build` inside its project folder.

## App features

- **Project 1:** React sign-up/login screen, plus `POST /api/auth/register`, `POST /api/auth/login`, and
  `GET /api/auth/me` (JWT bearer token required for `/me`).
- **Project 2:** React interface with a SimpleMDE Markdown editor. Create and save notes, reopen notes from this browser,
  and share an edit link. Anyone with a note's link can read and edit it; treat
  the link as a password. The SimpleMDE editor is loaded from a CDN.
- **Project 3:** React form to generate a README draft from project details, save the draft
  and inputs to MongoDB, and download it as `README.md`.

Each application exposes `GET /api/health` for a basic health check.
# Phase-7-mini-projects-

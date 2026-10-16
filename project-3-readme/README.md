# Mini Project 3: Gemini README Generator

Generate a README draft from a project name, description, and feature list. The
app calls Gemini from the server, stores each draft and its inputs in MongoDB's
`mini` database / `Mini project 3` collection, and lets you download the result.

## Start

```sh
cp .env.example .env
npm install
npm start
```

Fill in `.env`, including `GEMINI_API_KEY`, then open http://localhost:3003.
`npm start` builds the React frontend and serves the app and API together. The
key is used only by the server and should never be placed in browser code or
committed.

The generation endpoint is `POST /api/readmes` with JSON:

```json
{
  "projectName": "Task Tracker",
  "description": "A small app for organizing work.",
  "features": ["Create tasks", "Track progress"]
}
```

The frontend source is in `client/`; run `npm run build` to rebuild it
independently.

# Mini Project 2: Collaborative Markdown Notes

Create Markdown notes in the browser with SimpleMDE, persist them to MongoDB,
and share an edit link with collaborators. Notes are stored in the `mini`
database's `Mini project 2` collection.

## Start

```sh
cp .env.example .env
npm install
npm start
```

Fill in `.env`, then open http://localhost:3002. `npm start` builds the React
frontend and serves the app and API together. SimpleMDE assets are loaded from
cdnjs, so the browser needs internet access to load the editor.

## Collaboration and API

Create a note with `POST /api/notes` and then read or update it using
`GET /api/notes/:shareToken` or `PUT /api/notes/:shareToken`. The app creates a
random share token and puts it in the share URL. Anyone who has that URL can
read and edit the note; do not use the app for confidential notes.

The frontend source is in `client/`; run `npm run build` to rebuild it
independently.

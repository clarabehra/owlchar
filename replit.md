# Running OwlChar on Replit

The app uses the existing Bun lockfile and starts with:

```sh
PORT=5000 bun run dev
```

The Replit web workflow runs this command on port 5000. Add `GEMINI_API_KEY` as a Replit Secret to enable the Gemini-powered chat features.
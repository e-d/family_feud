# Family Feud

A single-page web app for running a game of Family Feud at home: import your own survey questions, host from your laptop, and put the board up on a TV or projector.

**Play it live: [family-feud-gules.vercel.app](https://family-feud-gules.vercel.app)**

## How it works

1. **Pick a ready-made game or import your own.** There are 14 ready-made games (six rounds each) across categories like Food & Drink, Kids, Animals and Grown-Ups, plus one per holiday that switches to its matching theme. Or upload a CSV, JSON or plain-text file, or paste text (formats below). Games are saved in your browser.
2. **Play** — name the two families and start.
3. **Open TV board** — opens the board in a new window. Drag it to the TV and click *Go full screen with sound* (or press `F`).
4. **Pick a theme** when you start (Classic, Halloween, Thanksgiving, Christmas, Valentine's Day or Independence Day). You can switch it from the host panel mid-game; the TV updates live.
5. **Host** from the control panel: reveal answers, add strikes, set double/triple points, and give the bank to a team.

**Sound** plays on the TV window once you click *Go full screen with sound*: soft theme music on the title screen (you can turn it off in the host panel), a theme sound when play starts (a wolf howl for Halloween, sleigh bells for Christmas, and so on), dings and buzzers during rounds, and applause on the final scores. Every sound is generated in the browser, so there are no audio files.

The host window and the board stay in sync through the browser (`BroadcastChannel`), so both windows need to be in the same browser on the same computer. There's no server.

### Host keyboard shortcuts

| Key | Action |
| --- | --- |
| `1`–`8` | Reveal or hide an answer |
| `X` | Strike |
| `Q` | Show or hide the question on the TV |
| `←` / `→` | Previous / next round |

## Import formats

**Plain text** — question on the first line, then one answer per line with its points; blank line between questions.

```
Name something people bring to the beach
Towel, 38
Sunscreen, 24

Name a pizza topping
Pepperoni, 48
Mushrooms, 17
```

**CSV** — columns `question,answer,points`. Leave the question blank to keep adding answers to the one above.

**JSON** — `[{ "question": "...", "answers": [{ "text": "...", "points": 48 }] }]`, or `{ "title": "...", "questions": [...] }`.

Answers are sorted by points; the board shows up to 8 per question.

## Development

```sh
npm install
npm run dev       # local dev server
npm test          # unit tests (importer + game logic)
npm run build     # type-check and build to dist/
```

Built with Vite, React and TypeScript. Deploys to Vercel as a static site with no configuration.

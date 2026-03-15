# Deploy to Vercel from your machine (bypasses broken Git)

Your code is fine. Vercel keeps building an old commit. Deploy the **current** code like this:

## 1. Log in (if needed)

```bash
npx vercel login
```

Follow the link to log in in the browser.

## 2. Deploy this project

From this folder (`coca-rpg`):

```bash
npx vercel --prod
```

(No global install needed—`npx` runs Vercel for you.)

- First time: it will ask “Set up and deploy?” → **Y**, and “Which scope?” → pick your account.
- Link to existing project: when it says “Link to existing project?” → **Y** and choose **coca-rpg**.
- It will **upload your local files** and build on Vercel’s servers. No Git involved.

That deployment will use your latest code and should build successfully.

---

**Later:** To fix Git deploys (so every `git push` deploys), you can try:

- Vercel Dashboard → **coca-rpg** → **Settings** → **Git** → **Disconnect**, then **Connect** again and pick `ppissarro/coca-rpg` and branch **main**.

Or create a **new** project: **Add New** → **Import** → `ppissarro/coca-rpg`, branch **main**, and use that project instead.

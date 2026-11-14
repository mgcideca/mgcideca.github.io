# MGCI DECA Training League

The chapter's training website: roleplay scoring on the 2026 DECA judge's forms, exam practice, and season standings.

- **The website** is the `docs` folder. GitHub Pages hosts it for free.
- **Accounts and data** (member logins, scores, questions) are stored in Firebase, Google's free backend. They are **not** in this repository. Members sign up with an email and password, then an exec approves the email they give you.

## What's in this repository

```
docs/                  the website (GitHub Pages publishes this folder)
  index.html
  css/styles.css
  js/config.js         ← your Firebase settings go here
  js/data.js           events, clusters, default settings, demo data
  js/scoring.js        points and standings maths
  js/backend.js        demo mode and Firebase data layers
  js/app.js            all pages
firestore.rules        database security rules (paste into the Firebase console)
sample-questions.csv   37 practice questions you can import to start the bank
```

## Setting it up

The full step-by-step guide is in the chat where this site was built. In short:

1. **Firebase:** create a project, turn on **Email/Password** sign-in (Authentication → Sign-in method), and create a Firestore database (Toronto region). Paste `firestore.rules` into Firestore → Rules → Publish. Register a web app and copy its config.
2. **GitHub:** upload this folder to a public repository. Paste the Firebase config into `docs/js/config.js`, replacing `firebase: null,`.
3. **Pages:** Settings → Pages → Deploy from a branch → `main` and `/docs` → Save.
4. **Connect:** add `<username>.github.io` (and your own domain, if you have one) to Firebase → Authentication → Settings → Authorized domains.
5. **Admin:** create an account on the site, then in Firestore → `users` → your document, set `role` to `admin` and `approved` to `true`.

While `firebase` is `null` in `config.js`, the site runs in **demo mode** with sample data that's stored only in the visitor's browser.

## Updating the site

- **Points, seasons, key dates, judge's forms, roles and questions** are changed on the live site (Admin and Exec tools). They don't need GitHub.
- **Code changes:** edit or upload files in `docs/` on GitHub. The site updates automatically within a few minutes. Check the **Actions** tab for a green check if it doesn't.
- **Never replace `docs/js/config.js`** with a copy that says `firebase: null`, or the site goes back to demo mode.
- **Download a backup** (Admin → Backups) before big changes and at the end of each season.

## Good to know

- **Public code.** The repository has to be public for free GitHub Pages. That's fine: the Firebase config in `config.js` is designed to be public, and the data is protected by `firestore.rules`. Don't put official DECA exams or any member data in this repository. Import questions through the site instead, where only approved members can see them.
- **Exam scores.** Exam practice is graded in the member's browser, so a determined member could inflate their own exam totals. Execs can spot outliers in the standings CSV export.
- **Hiding from standings.** Unticking "Show me on the standings" hides a member from the boards. Judge feedback is always private to that member and the execs.
## Member accounts

- **Signing up:** a member creates an account with their name, an email and a password (at least 6 characters). They wait on an approval screen until an exec approves them.
- **Approving:** the member tells you the email they used. You find it in Exec tools → Approvals and click Approve.
- **Forgotten passwords:** members click "Forgot your password?" on the sign-in screen, and Firebase emails them a reset link. These emails come from a `firebaseapp.com` address and sometimes land in spam, especially for school email addresses.
- **Removing someone:** Admin → Members and roles → Remove takes them off the site. To also free up their email so it can be used to sign up again (for example, if someone signed up with a member's email by mistake), delete it in Firebase → Authentication → Users as well.
- **Passwords:** Firebase stores passwords securely. Execs and admins can't see them.

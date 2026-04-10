# GenzKudo — HypeWall

Gen Z kudoboard app. **Node.js + Express** backend, **MongoDB Atlas** database, **Vercel** deployment.  
The frontend is plain HTML/CSS/JS — no build step needed.

---

## Project Structure

```
genzkudo/
├── backend/
│   ├── index.js          ← Express API + serves frontend in local dev
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── scripts/          ← api.js, board.js, main.js, ui.js, utils.js, view.js
│   ├── styles/
│   └── images/
└── vercel.json
```

---

## Local Development

### Step 1 — Get a MongoDB Atlas connection string

1. Go to https://cloud.mongodb.com → sign up or log in
2. Create a **free M0** cluster (any region)
3. Under **Database Access** → Add a user (username + password)
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all IPs)
5. Click **Connect → Drivers** → copy your connection string:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2 — Set up and run backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste your MongoDB URI:
```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Then install and run:
```bash
npm install
npm run dev
```

### Step 3 — Open the app

Visit **http://localhost:5000** — the Express server serves both the API and the frontend from one port. No separate frontend server needed.

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "Switch to Node/Express + MongoDB"
git push
```

### Step 2 — Import to Vercel

1. Go to https://vercel.com/new → import your GitHub repo
2. **Before deploying**, go to **Environment Variables** and add:
   - **Name:** `MONGODB_URI`
   - **Value:** your full Atlas connection string
3. Click **Deploy**

Vercel routes `/api/*` to `backend/index.js` and serves all static frontend files directly.

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/boards` | Create a board |
| GET | `/api/boards/:id` | Get board by ID |
| GET | `/api/boards/code/:code` | Look up by 6-char join code |
| GET | `/api/boards/view/:token` | Get board + comments by view token |
| POST | `/api/boards/:id/comments` | Add a comment |
| GET | `/api/boards/:id/comments` | Get all comments |
| DELETE | `/api/boards/:id/comments/:cid` | Delete a comment |

# shan-portfolio

One-page portfolio website with a fixed navbar, smooth scrolling, sections for Home/Skills/Experience/Projects, and GitHub project cards.

## Run locally

From the project folder:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Personalize

- Put your image file at: `shan_sillouhette.png` (project root).
- Update your GitHub username in `script.js`:
  - `const GITHUB_USERNAME = "shan";`
- Optional: show exact pinned repos by name in `script.js`:
  - `const PINNED_REPOS = ["repo-one", "repo-two"];`
  - If left empty, the site automatically shows top public repos.

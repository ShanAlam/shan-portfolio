const GITHUB_USERNAME = "ShanAlam";
const PINNED_REPOS = [];
const PROJECT_LIMIT = 6;

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-links");
const projectsGrid = document.getElementById("projects-grid");
const introOverlay = document.getElementById("intro-overlay");
const introGreeting = document.getElementById("intro-greeting");

function playIntro() {
  if (!introOverlay || !introGreeting) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const greetings = [
    "Hello",
    "مرحبا",
    "Hola",
    "नमस्ते",
    "Bonjour",
    "안녕하세요",
    "Ciao",
    "你好",
    "Konnichiwa",
    "Привет",
  ];

  document.body.classList.add("intro-active");

  if (prefersReducedMotion) {
    introGreeting.textContent = "Hello";
    setTimeout(() => {
      introOverlay.classList.add("is-hidden");
      document.body.classList.remove("intro-active");
    }, 500);
    return;
  }

  const firstFadeMs = 1500;
  const firstHoldMs = 420;
  const switchIntervalMs = 160;
  const holdAfterLastMs = 280;

  introGreeting.textContent = greetings[0];
  let greetingIndex = 1;
  const advanceGreeting = () => {
    if (greetingIndex >= greetings.length) {
      setTimeout(() => {
        introOverlay.classList.add("is-hidden");
        document.body.classList.remove("intro-active");
      }, holdAfterLastMs);
      return;
    }

    introGreeting.textContent = greetings[greetingIndex];
    greetingIndex += 1;
    setTimeout(advanceGreeting, switchIntervalMs);
  };

  introGreeting.style.transition = "none";
  introGreeting.style.opacity = "0";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      introGreeting.style.transition = `opacity ${firstFadeMs}ms ease`;
      introGreeting.style.opacity = "1";
    });
  });

  setTimeout(() => {
    introGreeting.style.transition = "none";
    setTimeout(advanceGreeting, firstHoldMs);
  }, firstFadeMs);
}

playIntro();

menuToggle?.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  navList.classList.toggle("open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navList.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const targetId = link.getAttribute("href")?.slice(1);
        link.classList.toggle("active", targetId === entry.target.id);
      });
    });
  },
  {
    rootMargin: "-40% 0px -45% 0px",
    threshold: 0.01,
  }
);

sections.forEach((section) => observer.observe(section));

function projectCard(repo) {
  const topicsHtml = Array.isArray(repo.topics) && repo.topics.length
    ? `
      <div class="project-topics">
        ${repo.topics
          .map((topic) => `<span class="topic-chip">${topic}</span>`)
          .join("")}
      </div>
    `
    : "";

  return `
    <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <span class="project-hover-text" aria-hidden="true">Open on GitHub</span>
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description available yet."}</p>
      ${topicsHtml}
    </a>
  `;
}

function fallbackProjectCard(repoName) {
  return `
    <a class="project-card" href="https://github.com/${GITHUB_USERNAME}/${repoName}" target="_blank" rel="noopener noreferrer">
      <span class="project-hover-text" aria-hidden="true">Open on GitHub</span>
      <h3>${repoName}</h3>
      <p>Open this project on GitHub.</p>
    </a>
  `;
}

async function fetchRepo(repoName) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`);
  if (!res.ok) return null;
  return res.json();
}

function parseOwnerRepo(repo) {
  if (repo.owner?.login && repo.name) {
    return { owner: repo.owner.login, name: repo.name };
  }

  if (repo.full_name && String(repo.full_name).includes("/")) {
    const [owner, name] = String(repo.full_name).split("/");
    return { owner, name };
  }

  if (repo.html_url) {
    const parts = String(repo.html_url)
      .replace("https://github.com/", "")
      .split("/")
      .filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], name: parts[1] };
    }
  }

  if (repo.name) {
    return { owner: GITHUB_USERNAME, name: repo.name };
  }

  return null;
}

async function fetchTopicsForRepo(repo) {
  const parsed = parseOwnerRepo(repo);
  if (!parsed) return { ...repo, topics: [] };

  try {
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.name}/topics`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) return { ...repo, topics: [] };
    const data = await res.json();
    const topics = Array.isArray(data.names) ? data.names : [];
    return { ...repo, topics };
  } catch (error) {
    return { ...repo, topics: [] };
  }
}

async function fetchPinnedRepos() {
  const dedupeByName = (repos) => {
    const seen = new Set();
    return repos.filter((repo) => {
      const key = String(repo.name || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  const cacheBust = Date.now();

  try {
    const egoistRes = await fetch(
      `https://gh-pinned-repos.egoist.dev/?username=${GITHUB_USERNAME}&t=${cacheBust}`,
      { cache: "no-store" }
    );
    if (egoistRes.ok) {
      const data = await egoistRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return dedupeByName(
          data.map((repo) => ({
            name: repo.repo,
            html_url: repo.link || `https://github.com/${GITHUB_USERNAME}/${repo.repo}`,
            description: repo.description || "Open this project on GitHub.",
            language: repo.language || "Mixed",
            stargazers_count: Number.isFinite(repo.stars) ? repo.stars : "-",
          }))
        );
      }
    }
  } catch (error) {
    // Try alternate pinned source below.
  }

  try {
    const berryRes = await fetch(
      `https://pinned.berrysauce.dev/get/${GITHUB_USERNAME}?t=${cacheBust}`,
      { cache: "no-store" }
    );
    if (!berryRes.ok) return [];

    const data = await berryRes.json();
    if (!Array.isArray(data) || data.length === 0) return [];

    return dedupeByName(
      data.map((repo) => ({
        name: repo.name,
        html_url: repo.link || `https://github.com/${GITHUB_USERNAME}/${repo.name}`,
        description: repo.description || "Open this project on GitHub.",
        language: repo.language || "Mixed",
        stargazers_count: Number.isFinite(repo.stars) ? repo.stars : "-",
      }))
    );
  } catch (error) {
    return [];
  }
}

async function loadProjects() {
  if (!projectsGrid) return;

  try {
    let selectedRepos = [];

    if (PINNED_REPOS.length > 0) {
      const pinnedResults = await Promise.all(PINNED_REPOS.map(fetchRepo));
      selectedRepos = pinnedResults.filter(Boolean);

      if (selectedRepos.length < PINNED_REPOS.length) {
        const fetchedNames = new Set(selectedRepos.map((repo) => repo.name.toLowerCase()));
        const missingPinned = PINNED_REPOS.filter(
          (name) => !fetchedNames.has(name.toLowerCase())
        );
        const fallbackPinned = missingPinned.map((name) => ({
          name,
          html_url: `https://github.com/${GITHUB_USERNAME}/${name}`,
          description: "Open this project on GitHub.",
          language: "GitHub",
          stargazers_count: "-",
        }));
        selectedRepos = [...selectedRepos, ...fallbackPinned];
      }
    }

    if (selectedRepos.length === 0) {
      selectedRepos = await fetchPinnedRepos();
    }

    if (selectedRepos.length === 0) {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
      );

      if (!response.ok) {
        throw new Error("Could not fetch GitHub projects");
      }

      const repos = await response.json();
      selectedRepos = repos
        .filter((repo) => !repo.fork)
        .sort((a, b) => {
          const starDiff = b.stargazers_count - a.stargazers_count;
          if (starDiff !== 0) return starDiff;
          return new Date(b.updated_at) - new Date(a.updated_at);
        })
        .slice(0, PROJECT_LIMIT);
    }

    if (!selectedRepos.length) {
      projectsGrid.innerHTML =
        '<div class="notice">No public repositories were found for this account.</div>';
      return;
    }

    selectedRepos = await Promise.all(selectedRepos.map(fetchTopicsForRepo));
    projectsGrid.innerHTML = selectedRepos.map(projectCard).join("");
  } catch (error) {
    if (PINNED_REPOS.length > 0) {
      projectsGrid.innerHTML = PINNED_REPOS.map(fallbackProjectCard).join("");
      return;
    }

    projectsGrid.innerHTML =
      '<div class="notice">Unable to load projects right now. Please try again later.</div>';
  }
}

loadProjects();

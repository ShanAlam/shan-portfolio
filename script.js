const GITHUB_USERNAME = "ShanAlam";
const PINNED_REPOS = [];
const PROJECT_LIMIT = 6;
const GITHUB_API_HEADERS = {
  Accept: "application/vnd.github+json",
};

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-links");
const projectsGrid = document.getElementById("projects-grid");
const introOverlay = document.getElementById("intro-overlay");
const introGreeting = document.getElementById("intro-greeting");

function addSkillTooltips() {
  const skillDescriptions = {
    Python: "General-purpose language used for automation, APIs, and AI workflows.",
    SQL: "Language for querying and managing relational data.",
    HTML: "Markup language for structuring web pages.",
    CSS: "Style language for designing and laying out web pages.",
    JavaScript: "Programming language that powers interactivity on the web.",
    LangGraph: "Framework for building stateful, multi-step LLM agent workflows.",
    LangChain: "Framework for building LLM apps with tools, memory, and retrieval.",
    FastMCP: "Framework for building MCP servers and tools quickly.",
    RAG: "Retrieval-Augmented Generation combines search with LLM responses.",
    ChromaDB: "Vector database for storing and searching embeddings.",
    Scikitlearn: "Machine learning library for classical ML models and preprocessing.",
    PyTorch: "Deep learning framework for building and training neural networks.",
    Keras: "High-level API for building and training deep learning models.",
    Kubernetes: "Container orchestration platform for deployment and scaling.",
    Docker: "Platform for packaging apps into portable containers.",
    "CI/CD": "Practices for automated build, test, and deployment pipelines.",
    FastAPI: "High-performance Python framework for building APIs.",
    Git: "Version control system for tracking code changes.",
    GitHub: "Platform for hosting Git repositories and collaboration.",
    Jira: "Project management and issue-tracking tool.",
    Pydantic: "Library for data validation and parsing using type hints.",
    Pytest: "Framework for writing and running automated tests.",
  };

  const skillTags = document.querySelectorAll(".about-skill-groups .about-tag");
  skillTags.forEach((tag) => {
    const skillName = tag.textContent?.trim();
    if (!skillName) return;
    const description = skillDescriptions[skillName];
    if (description) {
      tag.dataset.tooltip = description;
      tag.setAttribute("aria-label", `${skillName}: ${description}`);
    }
  });
}

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

function addScrollHoverStates() {
  let targets = Array.from(
    document.querySelectorAll(
      ".about-main-top, .about-skill-groups, .about-side-card, .experience-card, .project-card"
    )
  );
  if (!targets.length) return;

  if (!addScrollHoverStates.activeTarget) {
    addScrollHoverStates.activeTarget = null;
  }
  if (addScrollHoverStates.rafId == null) {
    addScrollHoverStates.rafId = null;
  }

  const updateActive = () => {
    addScrollHoverStates.rafId = null;
    const viewportCenter = window.innerHeight / 2;
    let bestTarget = null;
    let bestDistance = Infinity;
    let lastVisible = null;

    targets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      lastVisible = target;
      const targetCenter = rect.top + rect.height / 2;
      const isWhatIDo = target.classList.contains("about-main-top");
      if (isWhatIDo && rect.top > window.innerHeight * 0.52) return;
      const isSkillGroups = target.classList.contains("about-skill-groups");
      if (isSkillGroups && rect.top > window.innerHeight * 0.7) return;
      const distance = Math.abs(targetCenter - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTarget = target;
      }
    });

    const scrolledToBottom = window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (scrolledToBottom && lastVisible) {
      bestTarget = lastVisible;
    }

    if (bestTarget !== addScrollHoverStates.activeTarget) {
      if (addScrollHoverStates.activeTarget) {
        addScrollHoverStates.activeTarget.classList.remove("in-view");
      }
      addScrollHoverStates.activeTarget = bestTarget;
      if (addScrollHoverStates.activeTarget) {
        addScrollHoverStates.activeTarget.classList.add("in-view");
      }
    }
  };

  const scheduleUpdate = () => {
    if (addScrollHoverStates.rafId != null) return;
    addScrollHoverStates.rafId = window.requestAnimationFrame(updateActive);
  };

  if (!addScrollHoverStates.bound) {
    addScrollHoverStates.bound = true;
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
  }

  updateActive();

  // Allow re-scan when new cards are injected (e.g., projects).
  addScrollHoverStates.refresh = () => {
    targets = Array.from(
      document.querySelectorAll(
        ".about-main-top, .about-skill-groups, .about-side-card, .experience-card, .project-card"
      )
    );
    updateActive();
  };
}

playIntro();
addSkillTooltips();
addScrollHoverStates();

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
      <span class="project-folder-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
        </svg>
      </span>
      <span class="project-github-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.08 1.84 2.82 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.31-5.48-1.34-5.48-5.94 0-1.31.47-2.37 1.23-3.2-.12-.31-.53-1.56.12-3.24 0 0 1-.32 3.3 1.22a11.5 11.5 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.65 1.68.24 2.93.12 3.24.76.83 1.23 1.89 1.23 3.2 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"></path>
        </svg>
        <span class="project-github-label">Open in GitHub</span>
      </span>
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description available yet."}</p>
      ${topicsHtml}
    </a>
  `;
}

function fallbackProjectCard(repoName) {
  return `
    <a class="project-card" href="https://github.com/${GITHUB_USERNAME}/${repoName}" target="_blank" rel="noopener noreferrer">
      <span class="project-folder-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
        </svg>
      </span>
      <span class="project-github-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.08 1.84 2.82 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.31-5.48-1.34-5.48-5.94 0-1.31.47-2.37 1.23-3.2-.12-.31-.53-1.56.12-3.24 0 0 1-.32 3.3 1.22a11.5 11.5 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.65 1.68.24 2.93.12 3.24.76.83 1.23 1.89 1.23 3.2 0 4.61-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5z"></path>
        </svg>
        <span class="project-github-label">Open in GitHub</span>
      </span>
      <h3>${repoName}</h3>
      <p>Open this project on GitHub.</p>
    </a>
  `;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, options = {}, maxRetries = 2) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return {
          ok: true,
          response,
          data: await response.json(),
        };
      }

      const retryable = response.status === 403 || response.status === 429 || response.status >= 500;
      if (!retryable || attempt === maxRetries) {
        return { ok: false, response, status: response.status };
      }
    } catch (error) {
      if (attempt === maxRetries) {
        return { ok: false, error };
      }
    }

    const backoffMs = 300 * 2 ** attempt;
    await sleep(backoffMs);
    attempt += 1;
  }

  return { ok: false };
}

async function fetchRepo(repoName) {
  const result = await fetchJsonWithRetry(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
    { headers: GITHUB_API_HEADERS },
    1
  );
  return result.ok ? result.data : null;
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

  const existingTopics = Array.isArray(repo.topics) ? repo.topics : [];
  if (existingTopics.length > 0) {
    return { ...repo, topics: existingTopics };
  }

  try {
    const topicsResult = await fetchJsonWithRetry(
      `https://api.github.com/repos/${parsed.owner}/${parsed.name}/topics`,
      {
        headers: GITHUB_API_HEADERS,
      },
      2
    );

    if (topicsResult.ok) {
      const topics = Array.isArray(topicsResult.data?.names) ? topicsResult.data.names : [];
      if (topics.length > 0) {
        return { ...repo, topics };
      }
    }

    // Fallback endpoint: some responses include topics on the repository payload.
    const repoResult = await fetchJsonWithRetry(
      `https://api.github.com/repos/${parsed.owner}/${parsed.name}`,
      {
        headers: GITHUB_API_HEADERS,
      },
      1
    );

    if (repoResult.ok) {
      const topics = Array.isArray(repoResult.data?.topics) ? repoResult.data.topics : [];
      return { ...repo, topics };
    }

    console.warn(`Unable to load topics for ${parsed.owner}/${parsed.name}`);
    return { ...repo, topics: existingTopics };
  } catch (error) {
    console.warn(`Topic request failed for ${parsed.owner}/${parsed.name}`, error);
    return { ...repo, topics: existingTopics };
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
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`,
        {
          headers: GITHUB_API_HEADERS,
        }
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
    if (typeof addScrollHoverStates.refresh === "function") {
      addScrollHoverStates.refresh();
    }
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

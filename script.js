const GITHUB_USERNAME = "ShanAlam";
const PINNED_REPOS = [
  "langgraph-sandbox",
  "caesar-cipher",
  "blackjack",
  "blind-auction",
];
const PROJECT_LIMIT = 6;

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section");
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-links");
const projectsGrid = document.getElementById("projects-grid");

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
  return `
    <a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description available yet."}</p>
      <div class="meta">
        <span>${repo.language || "Mixed"}</span>
        <span>★ ${repo.stargazers_count}</span>
      </div>
    </a>
  `;
}

async function fetchRepo(repoName) {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`);
  if (!res.ok) return null;
  return res.json();
}

async function loadProjects() {
  if (!projectsGrid) return;

  try {
    let selectedRepos = [];

    if (PINNED_REPOS.length > 0) {
      const pinnedResults = await Promise.all(PINNED_REPOS.map(fetchRepo));
      selectedRepos = pinnedResults.filter(Boolean);
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

    projectsGrid.innerHTML = selectedRepos.map(projectCard).join("");
  } catch (error) {
    projectsGrid.innerHTML =
      '<div class="notice">Unable to load projects right now. Please try again later.</div>';
  }
}

loadProjects();

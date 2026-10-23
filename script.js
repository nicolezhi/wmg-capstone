const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector("#nav-links");

function closeNav() {
  navLinks.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.textContent = "Menu";
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.textContent = isOpen ? "Close" : "Menu";
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeNav);
});

const marquee = document.querySelector(".marquee");

if (marquee) {
  const track = marquee.querySelector(".marquee-track");
  const groups = [...track.querySelectorAll(".marquee-group")];
  const keywords = [...groups[0].children].map((item) => item.textContent);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function fillGroup(group, copies) {
    group.replaceChildren();

    for (let copy = 0; copy < copies; copy += 1) {
      keywords.forEach((word) => {
        const item = document.createElement("li");
        item.textContent = word;
        group.append(item);
      });
    }
  }

  function copiesNeeded() {
    const probe = groups[0];
    let copies = 0;

    probe.replaceChildren();

    while (probe.scrollWidth < marquee.clientWidth && copies < 24) {
      keywords.forEach((word) => {
        const item = document.createElement("li");
        item.textContent = word;
        probe.append(item);
      });
      copies += 1;
    }

    return Math.max(copies, 1);
  }

  function fillMarquee() {
    if (marquee.clientWidth === 0) {
      return;
    }

    const copies = copiesNeeded();
    groups.forEach((group) => fillGroup(group, copies));

    if (!reduceMotion.matches) {
      const distance = track.scrollWidth / 2;
      track.style.animationDuration = `${distance / 70}s`;
    }
  }

  fillMarquee();

  if (document.fonts) {
    document.fonts.load('0.95rem "Bootzy TM"').then(fillMarquee);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(fillMarquee, 150);
  });
}

const desktopNav = window.matchMedia("(min-width: 721px)");

desktopNav.addEventListener("change", (event) => {
  if (event.matches) {
    closeNav();
  }
});

const cardModal = document.querySelector(".card-modal");
const cardModalPanel = document.querySelector(".card-modal-panel");
const cardModalClose = document.querySelector(".card-modal-close");
const cardModalOverlay = document.querySelector(".card-modal-overlay");
const projectCards = document.querySelectorAll(".project-card");
const reduceCardMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let openCard = null;
let openTimer = 0;

function cardText(card, selector) {
  return card.querySelector(selector).textContent.trim();
}

function showCardModal(card) {
  const key = card.dataset.modal || "";
  let labelledBy = "card-modal-title";

  cardModal.querySelectorAll("[data-modal-panel]").forEach((panel) => {
    const match = panel.dataset.modalPanel === key;
    panel.hidden = !match;
    if (match && panel.dataset.labelledby) {
      labelledBy = panel.dataset.labelledby;
    }
  });

  cardModal.querySelector(".card-modal-simple").hidden = key !== "";
  cardModalPanel.setAttribute("aria-labelledby", labelledBy);

  if (key === "") {
    cardModal.querySelector(".card-modal-project").textContent = cardText(card, ".project-card-project");
    cardModal.querySelector(".card-modal-admission").textContent = cardText(card, ".project-card-admission");
    cardModal.querySelector("#card-modal-title").textContent = cardText(card, ".project-card-title");
    cardModal.querySelector(".card-modal-description").textContent = cardText(card, ".project-card-description");
  }

  cardModal.hidden = false;
  document.body.classList.add("card-modal-open");
  cardModalClose.focus();
}

function openProjectCard(card) {
  if (openCard) {
    return;
  }

  openCard = card;
  card.classList.add("is-opening");
  window.clearTimeout(openTimer);
  openTimer = window.setTimeout(showCardModal, reduceCardMotion.matches ? 0 : 420, card);
}

function closeProjectCard() {
  window.clearTimeout(openTimer);

  if (openCard) {
    openCard.classList.remove("is-opening");
    openCard.focus();
  }

  openCard = null;
  cardModal.hidden = true;
  document.body.classList.remove("card-modal-open");
  resetPhonePlayers();
}

function resetPhonePlayers() {
  cardModal.querySelectorAll(".phone-mockup").forEach((mockup) => {
    mockup.classList.remove("is-playing", "is-paused");
    const player = mockup.querySelector(".phone-player");
    const button = mockup.querySelector(".phone-play");

    if (player) {
      player.pause();
      player.currentTime = 0;
    }

    if (button) {
      button.setAttribute("aria-label", button.dataset.labelPlay);
    }
  });
}

function playPhone(mockup) {
  const player = mockup.querySelector(".phone-player");
  const button = mockup.querySelector(".phone-play");

  if (player.ended) {
    player.currentTime = 0;
  }

  mockup.classList.add("is-playing");
  mockup.classList.remove("is-paused");
  button.setAttribute("aria-label", button.dataset.labelPause);
  player.play();
}

function pausePhone(mockup) {
  const player = mockup.querySelector(".phone-player");
  const button = mockup.querySelector(".phone-play");

  player.pause();
  mockup.classList.add("is-paused");
  button.setAttribute("aria-label", button.dataset.labelPlay);
}

cardModal.querySelectorAll(".phone-mockup").forEach((mockup) => {
  const player = mockup.querySelector(".phone-player");

  mockup.addEventListener("click", (event) => {
    if (event.target.closest(".phone-play")) {
      return;
    }

    event.stopPropagation();

    if (mockup.classList.contains("is-playing") && !player.paused) {
      pausePhone(mockup);
    } else {
      playPhone(mockup);
    }
  });

  player.addEventListener("ended", () => {
    mockup.classList.add("is-paused");
    mockup.querySelector(".phone-play").setAttribute("aria-label", mockup.querySelector(".phone-play").dataset.labelPlay);
  });
});

cardModal.querySelectorAll(".phone-play").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const mockup = button.closest(".phone-mockup");
    const player = mockup.querySelector(".phone-player");

    if (mockup.classList.contains("is-playing") && !player.paused) {
      pausePhone(mockup);
    } else {
      playPhone(mockup);
    }
  });
});

projectCards.forEach((card) => {
  card.addEventListener("click", () => {
    openProjectCard(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProjectCard(card);
    }
  });
});

cardModalClose.addEventListener("click", closeProjectCard);
cardModalOverlay.addEventListener("click", closeProjectCard);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && openCard) {
    closeProjectCard();
  }
});

cardModalPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

const signatureCovers = [...document.querySelectorAll(".signature-cover")];
const signatureButtons = [...document.querySelectorAll(".signature-cover-button")];
const signatureMount = document.querySelector("#signature-spotify");
const signatureBar = document.querySelector(".signature-player-bar");
const signatureToggle = document.querySelector(".signature-player-toggle");
const signatureToggleLabel = signatureToggle.querySelector(".signature-player-toggle-label");
const signatureTitle = document.querySelector(".signature-player-title");

let spotifyApi = null;
let spotifyController = null;
let spotifyReady = false;
let activeUri = "";
let isPlaying = false;
let queuedUri = "";

function songButtons(uri) {
  return signatureButtons.filter((button) => button.dataset.spotify === uri);
}

function showSong(uri, playing) {
  activeUri = uri;
  isPlaying = playing;
  const buttons = songButtons(uri);
  const title = buttons[0]?.dataset.title || "";

  signatureCovers.forEach((cover) => {
    const button = cover.querySelector(".signature-cover-button");
    const selected = button.dataset.spotify === uri;
    cover.classList.toggle("is-playing", selected && playing);
    button.setAttribute("aria-pressed", String(selected && playing));
    button.setAttribute("aria-label", `${selected && playing ? "Pause" : "Play"} ${button.dataset.title}`);
  });

  signatureBar.hidden = false;
  signatureTitle.textContent = title;
  signatureToggleLabel.textContent = playing ? "Pause" : "Play";
  signatureToggle.classList.toggle("is-playing", playing);
  signatureToggle.setAttribute("aria-label", `${playing ? "Pause" : "Play"} ${title}`);
}

function startUri(uri) {
  if (!spotifyController) {
    queuedUri = uri;
    return;
  }

  if (activeUri === uri && isPlaying) {
    spotifyController.pause();
    showSong(uri, false);
    return;
  }

  const switching = activeUri !== uri;
  showSong(uri, true);

  if (switching) {
    spotifyController.loadUri(uri);
  }

  spotifyController.play();
}

function mountSpotify(then) {
  if (spotifyController) {
    then();
    return;
  }

  if (!spotifyApi) {
    queuedUri = queuedUri || "";
    return;
  }

  const first = signatureButtons[0];
  spotifyApi.createController(
    signatureMount,
    {
      uri: first.dataset.spotify,
      width: 352,
      height: 176,
    },
    (controller) => {
      spotifyController = controller;
      spotifyReady = true;
      controller.addListener("playback_update", (event) => {
        if (!activeUri) {
          return;
        }
        showSong(activeUri, !event.data.isPaused);
      });
      then();
    }
  );
}

function useSpotifyApi(api) {
  spotifyApi = api;
  if (queuedUri) {
    const uri = queuedUri;
    queuedUri = "";
    mountSpotify(() => startUri(uri));
  }
}

if (window.spotifyIframeApi) {
  useSpotifyApi(window.spotifyIframeApi);
}

document.addEventListener("spotify-iframe-ready", () => {
  useSpotifyApi(window.spotifyIframeApi);
});

signatureButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const uri = button.dataset.spotify;
    mountSpotify(() => startUri(uri));
    if (!spotifyController) {
      queuedUri = uri;
      showSong(uri, true);
    }
  });
});

signatureToggle.addEventListener("click", () => {
  if (!activeUri) {
    return;
  }
  mountSpotify(() => startUri(activeUri));
});

const chapterStage = document.querySelector(".chapter-stage");
const chapterRecords = [...document.querySelectorAll(".chapter-record")];
const chapterCopies = [...document.querySelectorAll(".chapter-copy-text")];

function closeChapterCopies() {
  chapterCopies.forEach((copy) => {
    copy.classList.remove("is-shown");
    copy.hidden = true;
  });
  chapterStage.classList.remove("is-open");
}

chapterRecords.forEach((record) => {
  record.addEventListener("click", () => {
    const wasOpen = record.classList.contains("is-open");

    chapterRecords.forEach((item) => {
      item.classList.remove("is-open");
      item.setAttribute("aria-expanded", "false");
    });
    closeChapterCopies();

    if (wasOpen) {
      return;
    }

    record.classList.add("is-open");
    record.setAttribute("aria-expanded", "true");

    const copy = document.getElementById(record.getAttribute("aria-controls"));
    if (!copy) {
      return;
    }

    copy.hidden = false;
    chapterStage.classList.add("is-open");
    requestAnimationFrame(() => {
      copy.classList.add("is-shown");
    });
  });
});

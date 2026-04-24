const STATUS_OPTIONS = new Set([
  "Planned",
  "Watching",
  "Completed",
  "Paused",
  "Dropped"
]);

let currentUser = null;
let tracker = [];
let currentCategory = "Home";
let selectedCategory = "Anime";
let selectedStatus = "Planned";
let searchQuery = "";
let searchResultsCache = [];
let editingTitle = "";
let deletingTitle = "";
let profileAvatarData = "";
let saveQueue = Promise.resolve();
let authListenerStarted = false;
let authLoadToken = 0;

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getFirebaseApi() {
  return {
    auth: window.auth,
    db: window.db,
    doc: window.doc,
    setDoc: window.setDoc,
    getDoc: window.getDoc,
    signOut: window.signOut,
    signInWithEmailAndPassword: window.signInWithEmailAndPassword,
    createUserWithEmailAndPassword: window.createUserWithEmailAndPassword,
    onAuthStateChanged: window.onAuthStateChanged
  };
}

function isFirebaseReady() {
  const api = getFirebaseApi();

  return Boolean(
    api.auth &&
      api.db &&
      api.doc &&
      api.setDoc &&
      api.getDoc &&
      api.signOut &&
      api.signInWithEmailAndPassword &&
      api.createUserWithEmailAndPassword &&
      api.onAuthStateChanged
  );
}

async function waitForFirebase(maxAttempts = 80) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (isFirebaseReady()) {
      return true;
    }

    await delay(100);
  }

  return false;
}

function getUserEmail() {
  return currentUser?.email || "";
}

function getProfileStorageKey() {
  const email = getUserEmail();
  return email ? `profile_avatar_${email}` : "profile_avatar_guest";
}

function getUserDocRef(uid) {
  const { db, doc } = getFirebaseApi();
  return doc(db, "users", uid);
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeTrackerList(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && (item.title || item.name))
    .map((item) => {
      const title = String(item.title || item.name || "Untitled").trim() || "Untitled";
      const total = Math.max(1, Number.parseInt(item.total, 10) || 1);
      const watched = Math.min(
        total,
        Math.max(0, Number.parseInt(item.watched, 10) || 0)
      );
      let status = String(item.status || "").trim();

      if (!STATUS_OPTIONS.has(status)) {
        status =
          watched === 0 ? "Planned" : watched < total ? "Watching" : "Completed";
      }

      return {
        id: item.id ?? null,
        title,
        image: String(item.image || ""),
        watched,
        total,
        status,
        category: String(item.category || "Anime").trim() || "Anime",
        mediaType: item.mediaType === "movie" ? "movie" : "tv"
      };
    });
}

function readLegacyTracker(email) {
  if (!email) {
    return [];
  }

  try {
    return sanitizeTrackerList(JSON.parse(localStorage.getItem("tracker_" + email)));
  } catch (error) {
    return [];
  }
}

async function writeTrackerToCloud(user, trackerPayload, options = {}) {
  const { setDoc } = getFirebaseApi();
  const payload = {
    email: user.email || "",
    tracker: sanitizeTrackerList(trackerPayload),
    updatedAt: new Date().toISOString()
  };

  if (options.migratedFromLocal) {
    payload.migratedFromLocal = true;
  }

  await setDoc(getUserDocRef(user.uid), payload, { merge: true });
}

async function fetchRemoteTracker(user) {
  const { getDoc } = getFirebaseApi();
  const snapshot = await getDoc(getUserDocRef(user.uid));

  if (!snapshot.exists()) {
    return {
      exists: false,
      tracker: []
    };
  }

  return {
    exists: true,
    tracker: sanitizeTrackerList(snapshot.data().tracker)
  };
}

async function loadTrackerForUser(user) {
  const remote = await fetchRemoteTracker(user);

  if (remote.exists) {
    return remote.tracker;
  }

  const legacyTracker = readLegacyTracker(user.email || "");

  if (legacyTracker.length) {
    await writeTrackerToCloud(user, legacyTracker, { migratedFromLocal: true });
    return legacyTracker;
  }

  await writeTrackerToCloud(user, []);
  return [];
}

function queueTrackerSync() {
  if (!currentUser) {
    return Promise.resolve(false);
  }

  const userSnapshot = currentUser;
  const trackerSnapshot = sanitizeTrackerList(tracker);

  saveQueue = saveQueue
    .catch(() => false)
    .then(async () => {
      try {
        await writeTrackerToCloud(userSnapshot, trackerSnapshot);
        return true;
      } catch (error) {
        showError("Cloud save failed. Please try again.");
        return false;
      }
    });

  return saveQueue;
}

function resolveMediaType(item) {
  if (selectedCategory === "Movies" || item.media_type === "movie") {
    return "movie";
  }

  if (item.title && item.release_date) {
    return "movie";
  }

  return "tv";
}

function updateSearchPlaceholder() {
  const input = document.getElementById("animeSearchInput");

  if (!input) {
    return;
  }

  input.placeholder =
    selectedCategory === "Movies" ? "Search movies here..." : "Search series here...";
}

function resetSearchModal() {
  const input = document.getElementById("animeSearchInput");
  const results = document.getElementById("searchResults");

  if (input) {
    input.value = "";
  }

  if (results) {
    results.innerHTML = "";
  }

  searchResultsCache = [];
}

function openAddSeries() {
  if (!currentUser) {
    openLogin();
    showWarning("Log in first to save your tracker.");
    return;
  }

  selectedCategory = currentCategory === "Home" ? "Anime" : currentCategory;
  selectedStatus = "Planned";

  setChoiceSelection("#categoryChoiceButtons", "categoryValue", selectedCategory);
  setChoiceSelection("#statusChoiceButtons", "statusValue", selectedStatus);

  closeModal();
  document.getElementById("categoryModal").classList.remove("hidden");
}

function confirmCategory() {
  selectedCategory =
    getActiveChoiceValue("#categoryChoiceButtons", "categoryValue") || "Anime";
  selectedStatus =
    getActiveChoiceValue("#statusChoiceButtons", "statusValue") || "Planned";

  document.getElementById("categoryModal").classList.add("hidden");
  document.getElementById("searchModal").classList.remove("hidden");
  updateSearchPlaceholder();
}

function confirmAdd() {
  confirmCategory();
}

function closeModal() {
  document.getElementById("searchModal").classList.add("hidden");
  resetSearchModal();
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.add("hidden");
}

function toggleProfileMenu() {
  document.getElementById("profileDropdown").classList.toggle("hidden");
}

function applyProfileAvatar() {
  const avatar = document.getElementById("profileAvatar");
  const fallback = document.getElementById("profileFallback");

  if (!avatar || !fallback) {
    return;
  }

  const hasAvatar = Boolean(profileAvatarData);
  avatar.src = hasAvatar ? profileAvatarData : "";
  avatar.classList.toggle("hidden", !hasAvatar);
  fallback.classList.toggle("hidden", hasAvatar);
}

function loadProfileAvatar() {
  try {
    profileAvatarData = localStorage.getItem(getProfileStorageKey()) || "";
  } catch (error) {
    profileAvatarData = "";
  }

  applyProfileAvatar();
}

function saveProfileAvatar(dataUrl) {
  profileAvatarData = dataUrl;

  try {
    localStorage.setItem(getProfileStorageKey(), dataUrl);
  } catch (error) {
    showError("Could not save the profile picture.");
    return;
  }

  applyProfileAvatar();
  showSuccess("Profile picture updated.");
}

function triggerProfileUpload() {
  document.getElementById("profileDropdown").classList.add("hidden");
  document.getElementById("profileUploadInput").click();
}

function handleProfileUpload(event) {
  const [file] = event.target.files || [];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showWarning("Please choose an image file.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") {
      saveProfileAvatar(reader.result);
    } else {
      showError("Could not read that image file.");
    }
  };
  reader.onerror = () => {
    showError("Could not upload that profile picture.");
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function localSearch() {
  searchQuery = normalizeText(document.getElementById("searchInput").value);
  render();
}

async function searchAnime() {
  const query = document.getElementById("animeSearchInput").value.trim();
  const resultsNode = document.getElementById("searchResults");

  if (query.length < 2) {
    searchResultsCache = [];
    resultsNode.innerHTML = "";
    return;
  }

  resultsNode.innerHTML = '<p class="muted">Searching...</p>';

  try {
    const response = await fetch(
      `https://little-mountain-71e9.sharmarishav2100.workers.dev?q=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results.slice(0, 8) : [];

    searchResultsCache = results;

    if (!results.length) {
      resultsNode.innerHTML = '<p class="muted">No results found for that search.</p>';
      return;
    }

    resultsNode.innerHTML = results
      .map((item) => {
        const title = escapeHtml(item.title || item.name || "Untitled");
        const year =
          item.release_date?.slice(0, 4) ||
          item.first_air_date?.slice(0, 4) ||
          "N/A";
        const mediaType = resolveMediaType(item);

        return `
          <div class="search-item">
            <div>
              <h3>${title}</h3>
              <p>${year}</p>
            </div>
            <button type="button" data-action="add-result" data-id="${item.id}" data-media-type="${mediaType}">
              Add
            </button>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    searchResultsCache = [];
    resultsNode.innerHTML =
      '<p class="muted">The search service is unavailable right now. Please try again in a moment.</p>';
  }
}

async function finalAddTMDB(itemId, mediaType) {
  if (!currentUser) {
    openLogin();
    showWarning("Log in first to save your tracker.");
    return;
  }

  const item = searchResultsCache.find((entry) => String(entry.id) === String(itemId));

  if (!item) {
    showWarning("That search result expired. Please search again.");
    return;
  }

  try {
    const response = await fetch(
      `https://little-mountain-71e9.sharmarishav2100.workers.dev?details=${item.id}&type=${mediaType}`
    );

    if (!response.ok) {
      throw new Error("Details request failed");
    }

    const data = await response.json();
    const total =
      mediaType === "movie"
        ? 1
        : data.number_of_episodes || data.number_of_seasons || 1;
    const title = item.title || item.name || "Untitled";

    const duplicate = tracker.some(
      (entry) =>
        normalizeText(entry.title) === normalizeText(title) &&
        entry.category === selectedCategory
    );

    if (duplicate) {
      closeModal();
      showWarning("This title is already added in this category.");
      return;
    }

    tracker.unshift({
      id: item.id,
      title,
      image: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "",
      watched:
        selectedStatus === "Completed"
          ? total
          : selectedStatus === "Watching"
            ? Math.min(1, total)
            : 0,
      total,
      status: selectedStatus,
      category: selectedCategory,
      mediaType
    });

    closeModal();
    save();
    showSuccess("The title was added to your tracker.");
  } catch (error) {
    showError("Could not load the series details.");
  }
}

function findItem(title) {
  return tracker.find((entry) => entry.title === title);
}

function increaseWatch(title) {
  const item = findItem(title);

  if (!item) {
    return;
  }

  if (item.watched < item.total) {
    item.watched += 1;
  }

  updateStatus(item, true);
  save();
}

function decreaseWatch(title) {
  const item = findItem(title);

  if (!item) {
    return;
  }

  if (item.watched > 0) {
    item.watched -= 1;
  }

  updateStatus(item, true);
  save();
}

function deleteAnime(title) {
  deletingTitle = title;
  document.getElementById("deleteModalMessage").innerText =
    `Are you sure you want to delete "${title}" from your tracker?`;
  document.getElementById("deleteModal").classList.remove("hidden");
}

function editAnime(title) {
  const item = findItem(title);

  if (!item) {
    return;
  }

  editingTitle = item.title;
  document.getElementById("editTitleInput").value = item.title;
  document.getElementById("editTotalInput").value = item.total;
  document.getElementById("editWatchedInput").value = item.watched;
  setEditStatusSelection(STATUS_OPTIONS.has(item.status) ? item.status : "Watching");
  document.getElementById("editModal").classList.remove("hidden");
}

function closeEditModal() {
  editingTitle = "";
  document.getElementById("editModal").classList.add("hidden");
}

function closeDeleteModal() {
  deletingTitle = "";
  document.getElementById("deleteModal").classList.add("hidden");
}

function setEditStatusSelection(status) {
  setChoiceSelection("#editStatusButtons", "statusValue", status);
}

function setChoiceSelection(containerSelector, dataKey, value) {
  const buttons = document.querySelectorAll(`${containerSelector} .choice-btn`);

  buttons.forEach((button) => {
    const isActive = button.dataset[dataKey] === value;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function getActiveChoiceValue(containerSelector, dataKey) {
  const activeButton = document.querySelector(`${containerSelector} .choice-btn.active`);
  return activeButton?.dataset[dataKey] || "";
}

function confirmDelete() {
  if (!deletingTitle) {
    closeDeleteModal();
    return;
  }

  tracker = tracker.filter((entry) => entry.title !== deletingTitle);
  closeDeleteModal();
  save();
  showSuccess("The title was removed from your tracker.");
}

function submitEditForm(event) {
  event.preventDefault();

  const item = findItem(editingTitle);

  if (!item) {
    closeEditModal();
    showError("Could not find that title anymore.");
    return;
  }

  const newTitle = document.getElementById("editTitleInput").value.trim();
  const totalValue = document.getElementById("editTotalInput").value.trim();
  const watchedValue = document.getElementById("editWatchedInput").value.trim();
  const newStatus = getActiveChoiceValue("#editStatusButtons", "statusValue") || "Watching";

  if (!newTitle) {
    showWarning("Please enter a title.");
    return;
  }

  const parsedTotal = Number.parseInt(totalValue, 10);
  const parsedWatched = Number.parseInt(watchedValue, 10);

  if (!Number.isFinite(parsedTotal) || parsedTotal < 1) {
    showWarning("Total episodes must be at least 1.");
    return;
  }

  if (!Number.isFinite(parsedWatched) || parsedWatched < 0) {
    showWarning("Watched episodes cannot be negative.");
    return;
  }

  item.title = newTitle;
  item.total = parsedTotal;
  item.watched = parsedWatched;

  if (STATUS_OPTIONS.has(newStatus)) {
    item.status = newStatus;
  } else {
    updateStatus(item, true);
  }

  updateStatus(item);
  closeEditModal();
  save();
  showSuccess("Your changes were saved.");
}

function updateStatus(item, forceProgressStatus = false) {
  if (!item) {
    return;
  }

  if (!Number.isFinite(item.total) || item.total < 1) {
    item.total = 1;
  }

  if (!Number.isFinite(item.watched) || item.watched < 0) {
    item.watched = 0;
  }

  if (item.watched > item.total) {
    item.watched = item.total;
  }

  if (
    !forceProgressStatus &&
    (item.status === "Paused" || item.status === "Dropped") &&
    item.watched > 0 &&
    item.watched < item.total
  ) {
    return;
  }

  if (item.watched === 0) {
    item.status = "Planned";
  } else if (item.watched < item.total) {
    item.status = "Watching";
  } else {
    item.status = "Completed";
  }
}

function save() {
  if (!currentUser) {
    openLogin();
    showWarning("Log in first.");
    return;
  }

  render();
  void queueTrackerSync();
}

function setCategory(category) {
  currentCategory = category;
  document.getElementById("pageTitle").innerText = category;
  render();
}

function matchesSearch(item) {
  if (!searchQuery) {
    return true;
  }

  const haystack = normalizeText(`${item.title} ${item.status} ${item.category}`);
  return haystack.includes(searchQuery);
}

function renderPoster(item) {
  if (item.image) {
    return `<img src="${item.image}" alt="${escapeHtml(item.title)} poster">`;
  }

  return '<div class="card-poster placeholder">No poster</div>';
}

function renderCard(item) {
  const encodedTitle = encodeURIComponent(item.title);

  return `
    <div class="card">
      ${renderPoster(item)}
      <span class="tag">${escapeHtml(item.category)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="progress">${item.watched}/${item.total} | ${escapeHtml(item.status)}</p>
      <div class="actions">
        <button type="button" class="green" data-action="increase" data-title="${encodedTitle}">+1</button>
        <button type="button" class="white" data-action="decrease" data-title="${encodedTitle}">-1</button>
        <button type="button" class="yellow" data-action="edit" data-title="${encodedTitle}">Edit</button>
        <button type="button" class="red" data-action="delete" data-title="${encodedTitle}">X</button>
      </div>
    </div>
  `;
}

function renderEmptyHome() {
  return `
    <div class="empty-home">
      <div class="overlay">
        <h2>Track every watch in one place</h2>
        <p>Keep your anime, donghua, dramas, and movies synced in one Firebase-powered tracker.</p>
        <button type="button" class="hero-btn" onclick="openAddSeries()">Add Anime</button>
      </div>
    </div>
  `;
}

function renderEmptyPanel(title, message) {
  return `
    <div class="empty-panel">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function updateAuthVisibility() {
  const isLoggedIn = Boolean(currentUser);
  document.getElementById("landingSection").classList.toggle("hidden", isLoggedIn);
  document.getElementById("currentlySection").classList.toggle("hidden", !isLoggedIn);
  document.getElementById("librarySection").classList.toggle("hidden", !isLoggedIn);
}

function render() {
  updateAuthVisibility();

  if (!currentUser) {
    document.getElementById("landingHero").innerHTML = renderEmptyHome();
    document.getElementById("currentlyWatching").innerHTML = "";
    document.getElementById("mainGrid").innerHTML = "";
    return;
  }

  document.getElementById("landingHero").innerHTML = "";

  const watchingList = tracker.filter(
    (item) => item.status === "Watching" && matchesSearch(item)
  );

  document.getElementById("currentlyWatching").innerHTML = watchingList.length
    ? watchingList.map(renderCard).join("")
    : renderEmptyPanel(
        "Nothing is in progress yet",
        "Titles you are currently watching will appear here first."
      );

  let filtered =
    currentCategory === "Home"
      ? tracker
      : tracker.filter((item) => item.category === currentCategory);

  filtered = filtered.filter(matchesSearch);

  if (!tracker.length && currentCategory === "Home" && !searchQuery) {
    document.getElementById("mainGrid").innerHTML = renderEmptyHome();
    return;
  }

  if (!filtered.length) {
    document.getElementById("mainGrid").innerHTML = renderEmptyPanel(
      searchQuery ? "No matching titles found" : "No titles in this section yet",
      searchQuery
        ? "Try adjusting your search."
        : "You can add a new title with Add Series."
    );
    return;
  }

  document.getElementById("mainGrid").innerHTML = filtered.map(renderCard).join("");
}

function openLogin() {
  document.getElementById("profileDropdown").classList.add("hidden");
  document.getElementById("loginModal").classList.remove("hidden");
}

function closeLogin() {
  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("password").value = "";
}

function getAuthErrorMessage(error, fallback) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in.";
    case "auth/invalid-email":
      return "The email format is invalid.";
    case "auth/weak-password":
      return "The password must be at least 6 characters long.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "The email or password is incorrect.";
    case "auth/network-request-failed":
      return "A network error occurred. Check your internet connection.";
    default:
      return fallback;
  }
}

async function login() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showWarning("Please enter both email and password.");
    return;
  }

  if (!isFirebaseReady()) {
    showWarning("Firebase is still initializing. Please try again in a moment.");
    return;
  }

  try {
    const { auth, signInWithEmailAndPassword } = getFirebaseApi();
    await signInWithEmailAndPassword(auth, email, password);
    closeLogin();
    showSuccess("Logged in successfully.");
  } catch (error) {
    showError(getAuthErrorMessage(error, "Login failed."));
  }
}

async function signup() {
  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showWarning("Email and password are required to sign up.");
    return;
  }

  if (!isFirebaseReady()) {
    showWarning("Firebase is still initializing. Please try again in a moment.");
    return;
  }

  try {
    const { auth, createUserWithEmailAndPassword } = getFirebaseApi();
    await createUserWithEmailAndPassword(auth, email, password);
    closeLogin();
    showSuccess("Account created successfully.");
  } catch (error) {
    showError(getAuthErrorMessage(error, "Could not create the account."));
  }
}

async function logout() {
  if (!isFirebaseReady()) {
    showWarning("Firebase is not ready yet.");
    return;
  }

  try {
    const { auth, signOut } = getFirebaseApi();
    await signOut(auth);
    document.getElementById("profileDropdown").classList.add("hidden");
    showSuccess("Logged out successfully.");
  } catch (error) {
    showError("Logout failed.");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("light-mode");
}

function contactUs() {
  window.location.href = "mailto:yourmail@gmail.com";
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");

  if (!container) {
    return;
  }

  const toneMap = {
    success: { title: "Success", icon: "OK" },
    error: { title: "Error", icon: "!" },
    warning: { title: "Notice", icon: "!" },
    info: { title: "Update", icon: "i" }
  };

  const tone = toneMap[type] || toneMap.info;
  const toast = document.createElement("div");

  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-badge" aria-hidden="true">${tone.icon}</div>
    <div class="toast-copy">
      <p class="toast-title">${tone.title}</p>
      <p class="toast-message">${escapeHtml(message)}</p>
    </div>
    <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
  `;

  const dismissToast = () => {
    if (!toast.isConnected || toast.classList.contains("is-closing")) {
      return;
    }

    toast.classList.add("is-closing");
    window.setTimeout(() => {
      toast.remove();
    }, 220);
  };

  toast.querySelector(".toast-close")?.addEventListener("click", dismissToast);
  container.prepend(toast);
  window.setTimeout(dismissToast, 2600);
}

function showSuccess(message) {
  showToast(message, "success");
}

function showError(message) {
  showToast(message, "error");
}

function showWarning(message) {
  showToast(message, "warning");
}

function handleCardAction(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const title = decodeURIComponent(button.dataset.title || "");

  switch (button.dataset.action) {
    case "increase":
      increaseWatch(title);
      break;
    case "decrease":
      decreaseWatch(title);
      break;
    case "edit":
      editAnime(title);
      break;
    case "delete":
      deleteAnime(title);
      break;
    default:
      break;
  }
}

function handleSearchResultAction(event) {
  const button = event.target.closest('button[data-action="add-result"]');

  if (!button) {
    return;
  }

  void finalAddTMDB(button.dataset.id, button.dataset.mediaType || "tv");
}

function bindEventListeners() {
  document.getElementById("mainGrid").addEventListener("click", handleCardAction);
  document
    .getElementById("currentlyWatching")
    .addEventListener("click", handleCardAction);
  document
    .getElementById("searchResults")
    .addEventListener("click", handleSearchResultAction);

  document.addEventListener("click", (event) => {
    const menu = document.getElementById("profileDropdown");
    const button = document.querySelector(".profile-icon");

    if (!menu || !button) {
      return;
    }

    const clickedInsideMenu = menu.contains(event.target);
    const clickedButton = button.contains(event.target);

    if (!clickedInsideMenu && !clickedButton) {
      menu.classList.add("hidden");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeCategoryModal();
      closeLogin();
      closeEditModal();
      closeDeleteModal();
    }
  });

  document.getElementById("editForm").addEventListener("submit", submitEditForm);
  document
    .getElementById("profileUploadInput")
    .addEventListener("change", handleProfileUpload);
  document.getElementById("editStatusButtons").addEventListener("click", (event) => {
    const button = event.target.closest(".choice-btn");

    if (!button) {
      return;
    }

    setEditStatusSelection(button.dataset.statusValue || "Watching");
  });
  document.getElementById("categoryChoiceButtons").addEventListener("click", (event) => {
    const button = event.target.closest(".choice-btn");

    if (!button) {
      return;
    }

    setChoiceSelection(
      "#categoryChoiceButtons",
      "categoryValue",
      button.dataset.categoryValue || "Anime"
    );
  });
  document.getElementById("statusChoiceButtons").addEventListener("click", (event) => {
    const button = event.target.closest(".choice-btn");

    if (!button) {
      return;
    }

    setChoiceSelection(
      "#statusChoiceButtons",
      "statusValue",
      button.dataset.statusValue || "Planned"
    );
  });
}

async function startAuthListener() {
  if (authListenerStarted) {
    return;
  }

  authListenerStarted = true;

  const ready = await waitForFirebase();

  if (!ready) {
    showError("Firebase could not connect. Please check the configuration.");
    return;
  }

  const { auth, onAuthStateChanged } = getFirebaseApi();

  onAuthStateChanged(auth, async (user) => {
    const loadToken = ++authLoadToken;

    if (!user) {
      currentUser = null;
      tracker = [];
      loadProfileAvatar();
      render();
      return;
    }

    currentUser = user;
    tracker = [];
    loadProfileAvatar();
    render();

    try {
      const nextTracker = await loadTrackerForUser(user);

      if (loadToken !== authLoadToken) {
        return;
      }

      tracker = nextTracker;
      render();
    } catch (error) {
      if (loadToken !== authLoadToken) {
        return;
      }

      tracker = [];
      render();
      showError("Could not load your cloud tracker.");
    }
  });
}

function initApp() {
  bindEventListeners();
  loadProfileAvatar();
  render();
  void startAuthListener();
}

initApp();

window.openAddSeries = openAddSeries;
window.confirmCategory = confirmCategory;
window.confirmAdd = confirmAdd;
window.closeModal = closeModal;
window.closeCategoryModal = closeCategoryModal;
window.toggleProfileMenu = toggleProfileMenu;
window.localSearch = localSearch;
window.searchAnime = searchAnime;
window.setCategory = setCategory;
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.login = login;
window.signup = signup;
window.logout = logout;
window.toggleDarkMode = toggleDarkMode;
window.contactUs = contactUs;
window.closeEditModal = closeEditModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.triggerProfileUpload = triggerProfileUpload;

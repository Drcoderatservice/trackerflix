let currentUser = localStorage.getItem("currentUser");
let tracker = currentUser
  ? JSON.parse(localStorage.getItem("tracker_" + currentUser)) || []
  : [];
let currentCategory = "Home";
let selectedCategory = "";
let selectedStatus = "";

// 🔹 CATEGORY SELECT
function openAddSeries(){
  document.getElementById("categoryModal").classList.remove("hidden");
}

function confirmCategory(){
  selectedCategory = document.getElementById("categorySelect").value;
  selectedStatus = document.getElementById("statusSelect").value;

  document.getElementById("categoryModal").classList.add("hidden");
  document.getElementById("searchModal").classList.remove("hidden");
}

function closeModal(){
  document.getElementById("searchModal").classList.add("hidden");
}

function toggleProfileMenu(){
  document.getElementById("profileDropdown").classList.toggle("hidden");
}

// 🔹 SEARCH
async function searchAnime(){
  let query = document.getElementById("animeSearchInput").value;

  if(query.length < 2){
    document.getElementById("searchResults").innerHTML="";
    return;
  }

  let res = await fetch(`https://little-mountain-71e9.sharmarishav2100.workers.dev?q=${query}`);
  let data = await res.json();

  document.getElementById("searchResults").innerHTML =
    data.results.slice(0,5).map(item=>`
      <div class="search-item">
        <div>
          <h3>${item.title || item.name}</h3>
          <p>${item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4) || "N/A"}</p>
        </div>
        <button onclick='finalAddTMDB(${JSON.stringify(item)})'>Add</button>
      </div>
    `).join("");
}

// 🔹 ADD SERIES
async function finalAddTMDB(item){

  let res = await fetch(
    `https://little-mountain-71e9.sharmarishav2100.workers.dev?details=${item.id}&type=tv`
  );

  let data = await res.json();

  let total = data.number_of_episodes || data.number_of_seasons || 1;

  tracker.push({
    title: item.title || item.name,
    image: item.poster_path 
      ? "https://image.tmdb.org/t/p/w500" + item.poster_path 
      : "",
    watched: selectedStatus === "Completed" ? total : 0,
    total: total,
    status: selectedStatus,
    category: selectedCategory
  });

  let user = localStorage.getItem("currentUser");
localStorage.setItem("tracker_" + user, JSON.stringify(tracker));

  document.getElementById("searchModal").classList.add("hidden");
  render();
}

// 🔹 BUTTON FUNCTIONS
function increaseWatch(title){
  let item = tracker.find(x=>x.title===title);
  if(item && item.watched < item.total){
    item.watched++;
  }
  updateStatus(item);
  save();
}

function decreaseWatch(title){
  let item = tracker.find(x=>x.title===title);
  if(item && item.watched > 0){
    item.watched--;
  }
  updateStatus(item);
  save();
}

function deleteAnime(title){
  tracker = tracker.filter(x=>x.title!==title);
  save();
}
function editAnime(title){

  let item = tracker.find(x => x.title === title);

  if(!item) return;

  let newTitle = prompt("Enter new title:", item.title);
  let newTotal = prompt("Enter total episodes:", item.total);
  let newWatched = prompt("Enter watched episodes:", item.watched);
  let newStatus = prompt("Enter status (Planned / Watching / Completed):", item.status);

  if(newTitle) item.title = newTitle;
  if(newTotal) item.total = parseInt(newTotal);
  if(newWatched) item.watched = parseInt(newWatched);
  if(newStatus) item.status = newStatus;

  save();
}

// 🔹 STATUS UPDATE
function updateStatus(item){
  if(item.watched === 0){
    item.status = "Planned";
  }else if(item.watched < item.total){
    item.status = "Watching";
  }else{
    item.status = "Completed";
  }
}

// 🔹 SAVE
function save(){
  let user = localStorage.getItem("currentUser");
  if(!user){
    alert("Login first!");
    return;
  }

  localStorage.setItem("tracker_" + user, JSON.stringify(tracker));
  render();
}

// 🔹 CATEGORY FILTER
function setCategory(cat){
  currentCategory = cat;
  document.getElementById("pageTitle").innerText = cat;
  render();
}

// 🔹 RENDER UI
function render(){
let watchingList = tracker.filter(x => x.status === "Watching");

document.getElementById("currentlyWatching").innerHTML =
  watchingList.map(item => `
    <div class="card">

      <img src="${item.image}">

      <h3>${item.title}</h3>

      <p>${item.watched}/${item.total} • ${item.status}</p>

      <div class="actions">
        <button class="green" onclick="increaseWatch('${item.title}')">+1</button>
        <button class="white" onclick="decreaseWatch('${item.title}')">-1</button>
        <button class="yellow" onclick="editAnime('${item.title}')">Edit</button>
        <button class="red" onclick="deleteAnime('${item.title}')">X</button>
      </div>

    </div>
  `).join("");
  let filtered = currentCategory==="Home"
    ? tracker
    : tracker.filter(x=>x.category===currentCategory);

  document.getElementById("mainGrid").innerHTML =
    filtered.map(item=>`
      <div class="card">

        <img src="${item.image}">

        <h3>${item.title}</h3>

        <p>${item.watched}/${item.total} • ${item.status}</p>

        <div class="actions">
          <button class="green" onclick="increaseWatch('${item.title}')">+1</button>
          <button class="white" onclick="decreaseWatch('${item.title}')">-1</button>
          <button class="yellow" onclick="editAnime('${item.title}')">Edit</button>
          <button class="red" onclick="deleteAnime('${item.title}')">X</button>
        </div>

      </div>
    `).join("");
}
function openLogin(){
  document.getElementById("loginModal").classList.remove("hidden");
}

function closeLogin(){
  document.getElementById("loginModal").classList.add("hidden");
}

function logout(){
  localStorage.removeItem("currentUser");
  tracker = [];
  render();
  showSuccess("Logged out successfully 👋");
}

function toggleDarkMode(){
  document.body.classList.toggle("light-mode");
}

function contactUs(){
  window.location.href = "mailto:yourmail@gmail.com";
}
function login(){
  let username = document.getElementById("username").value.trim();

  if(!username){
    alert("Enter username");
    return;
  }

  localStorage.setItem("currentUser", username);

  // reload tracker for this user
  tracker = JSON.parse(localStorage.getItem("tracker_" + username)) || [];

  closeLogin();
  render();
  showSuccess("Logged in successfully ✅");
}
// 🔹 INIT
render();
window.openLogin = openLogin;
window.logout = logout;
window.toggleDarkMode = toggleDarkMode;
window.contactUs = contactUs;
window.toggleProfileMenu = toggleProfileMenu;


window.login = login;

document.addEventListener("click", function(e) {
  let menu = document.getElementById("profileDropdown");
  let button = document.querySelector(".profile-btn"); // ya jo bhi button hai

  // agar click dropdown ya button pe nahi hua
  if (menu && !menu.contains(e.target) && !button.contains(e.target)) {
    menu.classList.add("hidden");
  }
});
function showSuccess(message) {
  let modal = document.getElementById("successModal");

  document.getElementById("successMessage").innerText = message;
  modal.classList.remove("hidden");

  setTimeout(() => {
    modal.classList.add("hidden");
  }, 2000);
}

let tracker = JSON.parse(localStorage.getItem("tracker")) || [];
let currentCategory="Home";
let selectedAnime=null;

async function searchAnime(){

let query=document.getElementById("animeSearchInput").value;
let category = selectedCategory || document.getElementById("categorySelect")?.value;

if(category==="Movies" || 
category==="WebSeries" || 
category==="CDrama" || 
category==="KDrama"){
searchTMDB(query);
return;

}
if(query.length < 2){
document.getElementById("searchResults").innerHTML="";
return;
}

const gql=`
query ($search: String) {
Page(perPage: 5){
media(search:$search,type:ANIME){
title{romaji}
episodes
seasonYear
coverImage{large}
}
}
}`;

let res=await fetch("https://graphql.anilist.co",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
query:gql,
variables:{search:query}
})
});

let data=await res.json();

let animeList=data.data.Page.media;

document.getElementById("searchResults").innerHTML=
animeList.map(anime=>`

<div class="search-item">
<div>
<h3>${anime.title.romaji}</h3>
<p>${anime.episodes} EP • ${anime.seasonYear}</p>
</div>

<button onclick='finalAddAnime(${JSON.stringify(anime)})'>
Add
</button>
</div>

`).join("");

document.getElementById("searchModal").classList.remove("hidden");

}

function closeModal(){
document.getElementById("searchModal").classList.add("hidden");
}

function openCategoryModal(anime){
selectedAnime=anime;
document.getElementById("categoryModal").classList.remove("hidden");
}

let selectedCategory = "";
let selectedStatus = "";

function confirmAdd(){

selectedCategory =
document.getElementById("categorySelect").value;

selectedStatus =
document.getElementById("statusSelect").value;

document.getElementById("categoryModal")
.classList.add("hidden");

document.getElementById("searchModal")
.classList.remove("hidden");

}

function setCategory(cat){
currentCategory=cat;
document.getElementById("pageTitle").innerText=cat;
render();
}

function render(){

let filtered = currentCategory === "Home"
? tracker
: tracker.filter(x => x.category === currentCategory);

let watchingList = tracker.filter(x => x.status === "Watching");

if(tracker.length === 0){

document.querySelector(".currently").style.display = "none";

document.getElementById("pageTitle").style.display = "none";

document.getElementById("mainGrid").innerHTML = `
<div class="empty-home">
<div class="overlay">
<h2>No Series Added Yet</h2>
<p>Login and Add Series to Start Tracking</p>
</div>
</div>
`;

return;

}

document.querySelector(".currently").style.display = "block";

document.getElementById("pageTitle").style.display = "block";

document.getElementById("currentlyWatching").innerHTML =
watchingList.map(cardHTML).join("");

document.getElementById("mainGrid").innerHTML =
filtered.map(cardHTML).join("");

}

function cardHTML(item){

return `
<div class="card">

<img src="${item.image}">

<h3>${item.title}</h3>

<div class="progress">
${item.watched}/${item.total} • ${item.status}
</div>

<div class="actions">

<button class="green" onclick="increaseWatch('${item.title}')">+1</button>

<button class="white" onclick="decreaseWatch('${item.title}')">-1</button>

<button class="yellow" onclick="editAnime('${item.title}')">Edit</button>

<button class="red" onclick="deleteAnime('${item.title}')">X</button>

</div>

</div>
`;
}

render();
function increaseWatch(title){

let anime = tracker.find(item => item.title === title);

if(anime.watched < anime.total){
anime.watched++;
}

if(anime.watched === 0){
anime.status = "Planned";
}
else if(anime.watched < anime.total){
anime.status = "Watching";
}
else if(anime.watched === anime.total){
anime.status = "Completed";
}

localStorage.setItem("tracker", JSON.stringify(tracker));


render();

}


function decreaseWatch(title){

let anime = tracker.find(item => item.title === title);

if(anime.watched > 0){
anime.watched--;
}

if(anime.watched === 0){
anime.status = "Planned";
}
else if(anime.watched < anime.total){
anime.status = "Watching";
}
else if(anime.watched === anime.total){
anime.status = "Completed";
}

localStorage.setItem("tracker", JSON.stringify(tracker));

render();

}


function deleteAnime(title){

tracker = tracker.filter(item => item.title !== title);

localStorage.setItem("tracker", JSON.stringify(tracker));

render();

}


function editAnime(title){

let anime = tracker.find(item => item.title === title);

let newTitle = prompt(
"Enter New Name:",
anime.title
);

if(newTitle){
anime.title = newTitle;
}

let newWatched = prompt(
"Enter Watched Episodes:",
anime.watched
);

if(newWatched !== null){
anime.watched = parseInt(newWatched);
}

let newTotal = prompt(
"Enter Total Episodes:",
anime.total
);

if(newTotal !== null){
anime.total = parseInt(newTotal);
}

let newStatus = prompt(
"Enter New Status:\nWatching / Completed / Paused / Dropped",
anime.status
);

if(newStatus){
anime.status = newStatus;
}

localStorage.setItem("tracker", JSON.stringify(tracker));

render();

}
function localSearch(){

let query = document.getElementById("searchInput").value.toLowerCase();

let filtered = tracker.filter(item =>
item.title.toLowerCase().includes(query)
);

document.getElementById("mainGrid").innerHTML =
filtered.map(cardHTML).join("");

}


function openAddSeries(){
  document.getElementById("categoryModal").classList.remove("hidden");
}
function closeCategoryModal(){

document.getElementById("categoryModal").classList.add("hidden");

}
async function finalAddAnime(anime){

tracker.push({
title:anime.title.romaji,
image:anime.coverImage.large,
watched:selectedStatus==="Completed" ? anime.episodes : 0,
total:anime.episodes,
status:selectedStatus,
category:selectedCategory
});

localStorage.setItem("tracker", JSON.stringify(tracker));
await setDoc(
doc(window.db,"users",window.auth.currentUser.uid),
{
tracker:tracker
}
);

document.getElementById("searchModal")
.classList.add("hidden");

render();

}
async function searchTMDB(query){



let res = await fetch(
`https://little-mountain-71e9.sharmarishav2100.workers.dev?q=${query}`
);

let data=await res.json();

document.getElementById("searchResults").innerHTML=
data.results.slice(0,5).map(item=>`

<div class="search-item">

<div>
<h3>${item.title || item.name}</h3>
<p>
${item.release_date?.slice(0,4) || item.first_air_date?.slice(0,4) || "N/A"}
</p>
</div>

onclick='finalAddTMDB(${JSON.stringify(item)})'
Add
</button>

</div>

`).join("");

}
async function finalAddTMDB(item)

  let type = "tv"; 

  let res = await fetch(
  `https://little-mountain-71e9.sharmarishav2100.workers.dev?details=${id}&type=${type}`
);
  let data = await res.json();

  let totalEpisodes = data.number_of_episodes || data.number_of_seasons || 1;

  tracker.push({
   title: "Series",

image: item.poster_path 
  ? "https://image.tmdb.org/t/p/w500" + item.poster_path 
  : "https://via.placeholder.com/300x450?text=No+Image", 
    watched: selectedStatus === "Completed" ? totalEpisodes : 0,
    total: totalEpisodes,
    status: selectedStatus,
    category: selectedCategory
  });

  localStorage.setItem("tracker", JSON.stringify(tracker));
  try{
  if(window.auth.currentUser){
    await setDoc(doc(window.db, "users", window.auth.currentUser.uid), {
      tracker: tracker
    });
  }
}catch(e){
  console.log("Firestore error:", e);
}

  document.getElementById("searchModal").classList.add("hidden");

  render();
}
function toggleProfileMenu(){
document.getElementById("profileDropdown").classList.toggle("hidden");
}

function toggleDarkMode(){
document.body.classList.toggle("light-mode");
}

function contactUs(){
window.location.href="mailto:yourmail@gmail.com";
}

async function logout(){

  await signOut(window.auth);

  alert("Logged Out");

  location.reload();
}

async function login(){

let email = document.getElementById("email").value;
let password = document.getElementById("password").value;

try{

await signInWithEmailAndPassword(
window.auth,
email,
password
);

alert("Login Successful");
  let userDoc = await getDoc(doc(window.db, "users", auth.currentUser.uid));

if(userDoc.exists()){
  tracker = userDoc.data().tracker || [];
  render();
}


localStorage.setItem("tracker",JSON.stringify(tracker));

render();

closeLogin();

}

catch(error){

alert(error.message);

}

}
async function signup(){

let email = document.getElementById("email").value;
let password = document.getElementById("password").value;
if(email === "" || password === ""){
alert("Please fill email and password first");
return;
}

try{

await createUserWithEmailAndPassword(
window.auth,
email,
password
);

alert("Signup Successful");

}

catch(error){

alert(error.message);

}

}
async function logout(){

try{

await signOut(window.auth);

tracker = [];

localStorage.removeItem("tracker");

render();

alert("Logged Out Successfully");

}

catch(error){

alert(error.message);

}

}

function openLogin(){
document.getElementById("loginModal").classList.remove("hidden");
}
function closeLogin(){
document.getElementById("loginModal").classList.add("hidden");
}
document.addEventListener("click", function(event){

let profileMenu = document.getElementById("profileDropdown");
let profileBtn = document.querySelector(".profile-icon");

if(
!profileBtn.contains(event.target) &&
!profileMenu.contains(event.target)
){
profileMenu.classList.add("hidden");
}

});
// ✅ FIX missing functions

function closeModal(){
  document.getElementById("searchModal").classList.add("hidden");
}

function setCategory(category){
  selectedCategory = category;
}

function toggleProfileMenu(){
  document.getElementById("profileDropdown").classList.toggle("hidden");
}
function confirmCategory(){
  selectedCategory = document.getElementById("categorySelect").value;
  selectedStatus = document.getElementById("statusSelect").value;

  document.getElementById("categoryModal").classList.add("hidden");
  document.getElementById("searchModal").classList.remove("hidden");
}

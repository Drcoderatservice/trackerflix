let tracker = JSON.parse(localStorage.getItem("tracker")) || [];
let currentCategory = "Home";
let selectedCategory = "";
let selectedStatus = "";

// 🔍 SEARCH ANIME / TMDB
async function searchAnime(){
  let query = document.getElementById("animeSearchInput").value;

  if(query.length < 2){
    document.getElementById("searchResults").innerHTML="";
    return;
  }

  let category = selectedCategory;

  if(["Movies","WebSeries","CDrama","KDrama"].includes(category)){
    searchTMDB(query);
    return;
  }

  const gql = `
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

  let res = await fetch("https://graphql.anilist.co",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({query:gql,variables:{search:query}})
  });

  let data = await res.json();
  let animeList = data.data.Page.media;

  document.getElementById("searchResults").innerHTML =
    animeList.map(anime=>`
      <div class="search-item">
        <div>
          <h3>${anime.title.romaji}</h3>
          <p>${anime.episodes} EP • ${anime.seasonYear}</p>
        </div>
        <button onclick='finalAddAnime(${JSON.stringify(anime)})'>Add</button>
      </div>
    `).join("");

  document.getElementById("searchModal").classList.remove("hidden");
}

// 🎬 TMDB SEARCH
async function searchTMDB(query){
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

// ➕ ADD ANIME
async function finalAddAnime(anime){
  tracker.push({
    title: anime.title.romaji,
    image: anime.coverImage.large,
    watched: selectedStatus==="Completed" ? anime.episodes : 0,
    total: anime.episodes,
    status: selectedStatus,
    category: selectedCategory
  });

  localStorage.setItem("tracker", JSON.stringify(tracker));
  saveToFirestore();

  document.getElementById("searchModal").classList.add("hidden");
  render();
}

// ➕ ADD TMDB
async function finalAddTMDB(item){
  let type = "tv";

  let res = await fetch(
    `https://little-mountain-71e9.sharmarishav2100.workers.dev?details=${item.id}&type=${type}`
  );

  let data = await res.json();

  let totalEpisodes = data.number_of_episodes || data.number_of_seasons || 1;

  tracker.push({
    title: item.title || item.name,
    image: item.poster_path
      ? "https://image.tmdb.org/t/p/w500" + item.poster_path
      : "",
    watched: selectedStatus === "Completed" ? totalEpisodes : 0,
    total: totalEpisodes,
    status: selectedStatus,
    category: selectedCategory
  });

  localStorage.setItem("tracker", JSON.stringify(tracker));
  saveToFirestore();

  document.getElementById("searchModal").classList.add("hidden");
  render();
}

// 🔥 SAVE FIRESTORE
async function saveToFirestore(){
  try{
    if(window.auth.currentUser){
      await setDoc(doc(window.db,"users",window.auth.currentUser.uid),{
        tracker: tracker
      });
    }
  }catch(e){
    console.log(e);
  }
}

// 🎨 UI FUNCTIONS
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

// 📊 RENDER
function render(){
  let filtered = currentCategory==="Home"
    ? tracker
    : tracker.filter(x=>x.category===currentCategory);

  document.getElementById("mainGrid").innerHTML =
    filtered.map(item=>`
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
    `).join("");
}

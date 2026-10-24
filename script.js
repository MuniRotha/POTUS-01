const DATA_URL = "travel_recommendation_api.json";

const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const btnClear = document.getElementById("btnClear");
const results = document.getElementById("results");

let travelData = null;

// Load the JSON once, then reuse it for every search.
async function loadData() {
  if (travelData) return travelData;
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error("Could not load " + DATA_URL);
  travelData = await response.json();
  console.log("Travel data loaded:", travelData);
  return travelData;
}

function showMessage(text) {
  results.innerHTML = `<p class="message">${text}</p>`;
}

function renderCards(items) {
  results.innerHTML = items
    .map(
      (item) => `
      <div class="card">
        <img src="${item.imageUrl}" alt="${item.name}"
             onerror="this.removeAttribute('onerror'); this.alt='Image coming soon: ${item.name.replace(/'/g, "")}';">
        <div class="card-body">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
      </div>`
    )
    .join("");
}

async function searchRecommendations() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) {
    showMessage("Please enter a keyword such as beach, temple, or country.");
    return;
  }

  try {
    const data = await loadData();
    let matches = [];

    if (keyword.startsWith("beach")) {
      matches = data.beaches;
    } else if (keyword.startsWith("temple")) {
      matches = data.temples;
    } else if (keyword.startsWith("countr")) {
      // "country" / "countries" -> a few cities from every country
      data.countries.forEach((c) => matches.push(...c.cities));
    } else {
      // A specific country name, e.g. "Japan", or part of a city name
      const country = data.countries.find((c) => c.name.toLowerCase() === keyword);
      if (country) {
        matches = country.cities;
      } else {
        data.countries.forEach((c) => {
          c.cities.forEach((city) => {
            if (city.name.toLowerCase().includes(keyword)) matches.push(city);
          });
        });
      }
    }

    if (matches.length === 0) {
      showMessage(`No recommendations found for "${searchInput.value.trim()}". Try beach, temple, country, Australia, Japan or Brazil.`);
    } else {
      renderCards(matches);
    }
  } catch (err) {
    console.error(err);
    showMessage("Sorry, something went wrong loading recommendations.");
  }
}

function clearResults() {
  searchInput.value = "";
  results.innerHTML = "";
}

if (btnSearch) {
  btnSearch.addEventListener("click", searchRecommendations);
  btnClear.addEventListener("click", clearResults);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchRecommendations();
  });
}

// Contact form: show a confirmation without leaving the page
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("formStatus").textContent =
      "Thank you for contacting us! We will get back to you soon.";
    contactForm.reset();
  });
}

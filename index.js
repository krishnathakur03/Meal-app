const main = document.querySelector("main");
const search = document.getElementById("search");
const details = document.getElementById("details");
const results = document.getElementById("results");
const favourites = document.getElementById('favourites');

let mealId;
let meals = [];
let favouriteMeals = [];
if (localStorage.getItem('favouriteMeals')) {
  favouriteMeals = JSON.parse(localStorage.getItem('favouriteMeals'));
  setFavourites();
}

async function checkFavourite(mealId) {
  let arr = ["fa-regular", "add to"];
  favouriteMeals.forEach((meal) => {
    if (mealId == meal.idMeal) {
      arr = ["fa-solid", "remove from"];
      return arr;
    }
  });
  return arr;
}

async function makeCard(meal) {
  // let favouriteClass = ['fa-solid', 'remove to'];
  // if (!isfav) {
  const  favouriteClass = await checkFavourite(meal.idMeal);
  // }
  const card = document.createElement("div");
  card.dataset.id = meal.idMeal;
  card.className = "card";
  card.title = "Show recipe";

  card.innerHTML = `
    <div class="mealImg">
        <img src="${meal.strMealThumb}" alt="img">
    </div>
    <div class="mealInfo">
        <h4>${meal.strMeal}</h4>
    </div>
    <div class="mealOption">
        <i class="${favouriteClass[0]} fa-heart" title="${favouriteClass[1]} your favourites"></i>
        <a href="${meal.strYoutube}" target="_blank" title="Watch recepi">
            <i class="fa-brands fa-youtube"></i>
        </a>
    </div>
  `;
  card.addEventListener('click', (e)=> {
    if (!e.target.classList.contains('fa-heart') && !e.target.classList.contains('fa-youtube') ) {
      details.classList.remove('hideDetails');
      details.classList.add('showDetails');
      toggleDetailSection(card.dataset.id);
      toggleSidebar(false);
    }
  });
  return card;
}

async function showResults() {
  results.innerHTML = "";
  if (meals.length <= 0) {
    console.log("no data");
    // make html for empty data
    results.innerHTML = "<p id='no-data'> No data found </p>";
    return;
  }
  //
  meals.forEach(async function (meal) {
    const card = await makeCard(meal);
    results.append(card);
  });
}

// Search data in Api by Id
async function getData(mealId) {
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.meals[0];
  } catch (error) {
    console.log('Error in fetch data by Id');
  }
  return;
}

// Search data in Api by name
async function searchMealInApi(name) {
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${name}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.meals) {
      meals = data.meals;
    } else {
      meals = [];
    }
  } catch (error) {
    console.log("Error in fetch data by name");
  }

  showResults();
}

function toggleSidebar(isOn) {
  if (isOn) {
    sideBar.classList.remove("sideBarOff");
    sideBar.classList.add("sideBarOn");
    main.classList.add("blur");
  } else {
    sideBar.classList.remove("sideBarOn");
    sideBar.classList.add("sideBarOff");
    main.classList.remove("blur");
  }
}

function setFavourites() {
  favourites.innerHTML = '';
  favouriteMeals.forEach(async (meal)=>{
    const card = await makeCard(meal);
    favourites.append(card);
  })
  localStorage.setItem('favouriteMeals', JSON.stringify(favouriteMeals));
}

async function toggleFavourite(meal) {
  const card = meal.parentElement.parentElement;
  if (meal.classList.contains('fa-regular')) {
    meal.classList.remove('fa-regular');
    meal.classList.add('fa-solid');
    meal.title = 'remove from your favourite';
    const mealData = await getData(card.dataset.id);
    favouriteMeals.push(mealData);
  } else if (meal.classList.contains('fa-solid')) {
    meal.classList.remove('fa-solid');
    meal.classList.add('fa-regular');
    meal.title = 'add to your favourite';
    favouriteMeals = favouriteMeals.filter((meal)=>{
      if (meal.idMeal != card.dataset.id) {
        return true;
      }
      return false;
    })
  }
  setFavourites();
  showResults();
  toggleDetailSection();
}

async function getList(meal) {
  let lists = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal["strIngredient" + i];
    const mesurement = meal["strMeasure" + i];
    if (ingredient == "") {
      break;
    }
    lists += `<li>${ingredient} (${mesurement})</li>`;
  }
  return lists;
}

async function toggleDetailSection(mealId) {
  if (!mealId) {
    mealId = this.mealId;
  }else {
    this.mealId = mealId;
  }
  const meal = await getData(mealId);
  const favouriteClass = await checkFavourite(mealId);
  const lists = await getList(meal);

  details.innerHTML = `
  <div data-id="${mealId}">
  <div id="top-div">
      <div id="img-div">
        <img src="${meal.strMealThumb}" alt="img">
      </div>
      <div id="name-div">
        <h3>Name: ${meal.strMeal}</h3>
        <h4>Category: ${meal.strCategory}</h4>
        <h4>Ingredients:</h4>
        <ul>
            ${lists}
            </ul>
            </div>
            </div>
    <div id="instruction-div">
      <p>${meal.strInstructions}</p>
    </div>
    <div id="icon-div">
      <i class="${favouriteClass[0]} fa-heart" title="${favouriteClass[1]} your favourites"></i>
      <a href="${meal.strYoutube}" target="_blank">
        <i class="fa-brands fa-youtube" title="Watch recipe"></i>
      </a>
    </div>  
    </div>
    <div id="closeDetails">
      <i class="fa-solid fa-xmark" title="close details"></i>
    </div>
  `;
  document.getElementById('closeDetails').addEventListener('click', closeDetails);

}

function closeDetails() {
  if (details.classList.contains('showDetails')) {
    details.classList.remove('showDetails');
    details.classList.add('hideDetails');
  }
}

function handleClick(e) {
  if (
    e.target.classList.contains("fa-magnifying-glass") &&
    search.value != ""
  ) {
    closeDetails();
    searchMealInApi(search.value);
  } else if (e.target.id == 'search') {
    closeDetails();
  } else if (e.target.id == "sideMenu") {
    toggleSidebar(true);
  } else if (e.target.id == "closeMenu") {
    toggleSidebar(false);
  } else if (e.target.classList.contains("fa-heart")) {
    // toggle meal
    toggleFavourite(e.target);
    console.log("fav change");
  }
}

function handleInput(e) {
  if (e.target.value.length > 0) {
    searchMealInApi(e.target.value);
  }
}

document.addEventListener("click", handleClick);
search.addEventListener("keyup", handleInput);

main.addEventListener("click", () => {
  if (sideBar.classList.contains("sideBarOn")) {
    sideBar.classList.remove("sideBarOn");
    sideBar.classList.add("sideBarOff");
    main.classList.remove("blur");
  }
});

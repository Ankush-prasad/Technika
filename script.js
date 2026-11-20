const restaurants = [
  { name: "Domino's Pizza", rating: "4.8 (67)", distance: "0.8 mi", distanceKm: 1.3, time: "15-25 min", mark: "DOMINO'S", color: "blue" },
  { name: "Pizza Hut", rating: "4.4 (152)", distance: "1.1 mi", distanceKm: 1.8, time: "20-35 min", mark: "Pizza Hut", color: "red" },
  { name: "Caroos Restaurant", rating: "4.7 (95)", distance: "1.2 mi", distanceKm: 1.9, time: "20-35 min", mark: "CAROOS", color: "dark" },
  { name: "McDonald's", rating: "4.6 (245)", distance: "0.8 mi", distanceKm: 1.2, time: "10-20 min", mark: "McDonald's", color: "yellow" },
  { name: "KFC", rating: "4.4 (216)", distance: "1.5 mi", distanceKm: 2.4, time: "20-35 min", mark: "KFC", color: "kfc" },
  { name: "Burger King", rating: "4.2 (147)", distance: "1.5 mi", distanceKm: 2.4, time: "20-40 min", mark: "BURGER KING", color: "bk" }
];

const foods = [
  { name: "Zing N Fries Meal", price: 4.3, rating: 4.3, time: "10-20 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=85", badge: "Free Delivery" },
  { name: "Delicious Cheese Pie", price: 12.5, rating: 4.1, time: "15-25 min", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=85", badge: "Buy 2 get 1 free" },
  { name: "Buddy Zinger-Combo", price: 9.8, rating: 4.5, time: "20-30 min", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=85", badge: "Free Delivery" },
  { name: "Gigantic Fodeo Burger", price: 8.5, rating: 4.3, time: "10-25 min", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=700&q=85", badge: "Free Delivery" },
  { name: "Chizza Meal", price: 11.2, rating: 4.8, time: "15-25 min", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=700&q=85", badge: "Buy 2 get 1 free" },
  { name: "Kfc Shakinata Bucket", price: 14.5, rating: 4.8, time: "20-30 min", image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=700&q=85", badge: "Free Delivery" }
];

const restaurantGrid = document.getElementById("restaurants");
const foodGrid = document.getElementById("foodGrid");
const dialog = document.getElementById("appDialog");
const dialogContent = document.getElementById("dialogContent");
const cart = [];
const favourites = new Set();
let activeView = "Explore";
let lastOrder = [];
let radiusKm = 10;
let serviceMode = "Pickup";
let dealsOnly = false;
let sortMode = "Today";
let currentLocation = 0;
let themeMode = "zesty";
let reduceMotion = false;
const locations = ["Elizabeth, New Jersey", "Newark, New Jersey", "Hillside, New Jersey"];
let searchTerm = "";

function renderRestaurants() {
  const visible = restaurants.filter((item) => item.name.toLowerCase().includes(searchTerm) && item.distanceKm <= radiusKm);
  restaurantGrid.innerHTML = visible.map((item) => `
    <article class="restaurant-card" role="button" tabindex="0" aria-label="View ${item.name}">
      <div class="restaurant-logo ${item.color}">${item.mark}</div>
      <div class="restaurant-info">
        <h3>${item.name}</h3>
        <div class="meta"><span class="star">★</span>${item.rating}<i></i><span class="tag">Buy 2 get 1 free</span></div>
        <div class="amenities"><span>♟ ${item.distance}</span><i></i><span>◷ ${item.time}</span></div>
      </div>
    </article>`).join("");

  restaurantGrid.querySelectorAll(".restaurant-card").forEach((card, index) => {
    const restaurant = visible[index];
    card.addEventListener("click", () => showRestaurant(restaurant));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showRestaurant(restaurant);
      }
    });
  });
  setEmptyState(restaurantGrid, visible.length === 0, "No restaurants match those filters.");
}

function visibleFoods() {
  let items = foods.filter((item) => item.name.toLowerCase().includes(searchTerm));
  if (dealsOnly) items = items.filter((item) => item.badge.includes("Buy"));
  if (activeView === "Favourites") items = items.filter((item) => favourites.has(item.name));
  if (sortMode === "Top rated") items = [...items].sort((a, b) => b.rating - a.rating);
  if (sortMode === "Fastest") items = [...items].sort((a, b) => Number.parseInt(a.time) - Number.parseInt(b.time));
  return items;
}

function renderFoods() {
  const items = visibleFoods();
  foodGrid.innerHTML = items.map((item) => `
    <article class="food-card">
      <div class="food-image">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <button class="heart ${favourites.has(item.name) ? "liked" : ""}" type="button" aria-label="${favourites.has(item.name) ? "Remove from" : "Add to"} favourites" aria-pressed="${favourites.has(item.name)}">${favourites.has(item.name) ? "♥" : "♡"}</button>
      </div>
      <div class="food-details">
        <div>
          <h3>${item.name}</h3>
          <div class="meta"><span class="star">★</span>${item.rating.toFixed(1)} (100)<i></i><span>◷ ${item.time}</span></div>
        </div>
        <span class="delivery-tag ${item.badge.includes("Buy") ? "free-tag" : ""}">${item.badge}</span>
      </div>
      <button class="add-button" type="button">Add · $${item.price.toFixed(2)}</button>
    </article>`).join("");

  foodGrid.querySelectorAll(".food-card").forEach((card, index) => {
    const item = items[index];
    card.querySelector(".heart").addEventListener("click", () => {
      if (favourites.has(item.name)) favourites.delete(item.name);
      else favourites.add(item.name);
      renderFoods();
    });
    card.querySelector(".add-button").addEventListener("click", () => addToCart(item));
  });
  setEmptyState(foodGrid, items.length === 0, activeView === "Favourites" ? "No favourites yet. Tap a heart on a meal to save it." : "Nothing tasty found. Try another search.");
}

function setEmptyState(container, isEmpty, message) {
  const existing = container.parentElement.querySelector(`.empty-state[data-for="${container.id}"]`);
  if (existing) existing.remove();
  container.hidden = isEmpty;
  if (isEmpty) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.dataset.for = container.id;
    empty.textContent = message;
    container.insertAdjacentElement("afterend", empty);
  }
}

function addToCart(item) {
  const entry = cart.find((line) => line.item.name === item.name);
  if (entry) entry.quantity += 1;
  else cart.push({ item, quantity: 1 });
  updateCartCount();
  showToast(`${item.name} added to your cart`);
}

function updateCartCount() {
  document.getElementById("cartCount").textContent = cart.reduce((total, line) => total + line.quantity, 0);
}

function showDialog(content) {
  dialogContent.innerHTML = content;
  if (!dialog.open) dialog.showModal();
}

function showCart() {
  const total = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const contents = cart.length ? `
    <div class="cart-lines">${cart.map((line, index) => `
      <div class="cart-line">
        <div><strong>${line.item.name}</strong><small>$${line.item.price.toFixed(2)} each</small></div>
        <div class="quantity-control">
          <button type="button" data-cart-action="decrease" data-index="${index}" aria-label="Decrease ${line.item.name} quantity">−</button>
          <span>${line.quantity}</span>
          <button type="button" data-cart-action="increase" data-index="${index}" aria-label="Increase ${line.item.name} quantity">+</button>
        </div>
      </div>`).join("")}</div>
    <div class="cart-total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
    <button class="dialog-action" type="button" data-dialog-action="checkout">Place order · $${total.toFixed(2)}</button>` : `
    <div class="dialog-empty"><span>🛍️</span><p>Your cart is still hungry.</p><button class="dialog-action" type="button" data-dialog-action="browse">Browse popular meals</button></div>`;
  showDialog(`<h2 id="dialogTitle">Your cart <span class="cart-item-count">${cart.reduce((sum, line) => sum + line.quantity, 0)} items</span></h2>${contents}`);
}

function showRestaurant(restaurant) {
  showDialog(`<span class="dialog-eyebrow">NEARBY FAVORITE</span><h2 id="dialogTitle">${restaurant.name}</h2><p class="dialog-copy">★ ${restaurant.rating} · ${restaurant.distance} away · ${restaurant.time}</p><p class="dialog-copy">Fresh favorites, delivered with a smile. Browse popular picks and add them to your cart.</p><button class="dialog-action" type="button" data-dialog-action="browse">Browse popular meals</button>`);
}

function showOrders() {
  if (!lastOrder.length) {
    showDialog(`<span class="dialog-eyebrow">ORDER HISTORY</span><h2 id="dialogTitle">No orders yet</h2><p class="dialog-copy">Your next delicious order will show up here.</p><button class="dialog-action" type="button" data-dialog-action="browse">Find something tasty</button>`);
    return;
  }
  const total = lastOrder.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  showDialog(`<span class="dialog-eyebrow">ORDER HISTORY</span><h2 id="dialogTitle">Your latest order</h2><div class="cart-lines">${lastOrder.map((line) => `<div class="cart-line"><strong>${line.quantity} × ${line.item.name}</strong><strong>$${(line.item.price * line.quantity).toFixed(2)}</strong></div>`).join("")}</div><div class="cart-total"><span>Order total</span><strong>$${total.toFixed(2)}</strong></div><p class="dialog-copy">Status: confirmed · Preparing your good stuff</p>`);
}

function setView(view) {
  const goHome = view === "Home";
  activeView = goHome ? "Explore" : view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    const active = button.dataset.section === (goHome ? "Home" : view);
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (goHome) {
    dealsOnly = false;
    document.getElementById("dealsButton").classList.remove("selected");
    renderFoods();
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector(".content").scrollTo({ top: 0, behavior: "smooth" });
  } else if (view === "Explore") {
    dealsOnly = false;
    document.getElementById("dealsButton").classList.remove("selected");
    renderFoods();
    document.getElementById("foodGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (view === "Favourites") {
    dealsOnly = false;
    document.getElementById("dealsButton").classList.remove("selected");
    renderFoods();
    document.getElementById("foodGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (view === "Orders") showOrders();
  else if (view === "Messages") showMessages();
  else if (view === "Settings") showSettings();
}

function showMessages() {
  showDialog(`<span class="dialog-eyebrow">WE'RE HERE FOR YOU</span><h2 id="dialogTitle">Talk to FoodGo</h2><p class="dialog-copy">Need a hand with an order? Send our team a quick message.</p><form class="message-form" id="messageForm"><label for="messageInput">Your message</label><textarea id="messageInput" required maxlength="300" placeholder="How can we help?"></textarea><button class="dialog-action" type="submit">Send message</button></form>`);
}

function showSettings() {
  showDialog(`<span class="dialog-eyebrow">MAKE IT YOURS</span><h2 id="dialogTitle">Settings</h2><label class="setting-row" for="themeSelect"><span>Color mood</span><select id="themeSelect"><option value="zesty" ${themeMode === "zesty" ? "selected" : ""}>Zesty lime</option><option value="sunset" ${themeMode === "sunset" ? "selected" : ""}>Sunset orange</option></select></label><label class="setting-row" for="calmToggle"><span>Reduce motion</span><input id="calmToggle" type="checkbox" ${reduceMotion ? "checked" : ""}></label><p class="dialog-copy">Preferences are applied immediately for this visit.</p>`);
}

function showProfile() {
  showDialog(`<span class="dialog-eyebrow">YOUR ACCOUNT</span><h2 id="dialogTitle">Annette Black</h2><p class="dialog-copy">annetteb42@gmail.com</p><p class="dialog-copy">Elizabeth, New Jersey</p><button class="dialog-action" type="button" data-dialog-action="profile-message">Contact support</button>`);
}

renderRestaurants();
renderFoods();

document.querySelector(".brand").addEventListener("click", () => setView("Home"));
document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.section)));
document.querySelector(".promo-close").addEventListener("click", (event) => event.currentTarget.closest(".promo-card").remove());
document.querySelector(".order-button").addEventListener("click", () => {
  setView("Explore");
  showToast("Grocery picks are ready below");
});
document.querySelector(".profile").addEventListener("click", showProfile);
document.querySelectorAll(".cart-button").forEach((button) => button.addEventListener("click", showCart));
document.getElementById("exploreButton").addEventListener("click", () => {
  setView("Explore");
  document.getElementById("foodGrid").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("searchInput").addEventListener("input", (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderRestaurants();
  renderFoods();
});
document.getElementById("sortButton").addEventListener("click", (event) => {
  const modes = ["Today", "Top rated", "Fastest"];
  sortMode = modes[(modes.indexOf(sortMode) + 1) % modes.length];
  event.currentTarget.querySelector("span").textContent = sortMode;
  renderFoods();
});
document.getElementById("distanceButton").addEventListener("click", (event) => {
  const distances = [10, 2, 5];
  radiusKm = distances[(distances.indexOf(radiusKm) + 1) % distances.length];
  event.currentTarget.querySelector("span").textContent = `${radiusKm} km`;
  renderRestaurants();
});
document.getElementById("locationButton").addEventListener("click", (event) => {
  currentLocation = (currentLocation + 1) % locations.length;
  event.currentTarget.querySelector("strong").textContent = locations[currentLocation];
  showToast(`Delivery location: ${locations[currentLocation]}`);
});
document.getElementById("serviceModeButton").addEventListener("click", (event) => {
  serviceMode = serviceMode === "Pickup" ? "Delivery" : "Pickup";
  event.currentTarget.querySelector("strong").textContent = serviceMode;
  showToast(`Order mode set to ${serviceMode.toLowerCase()}`);
});
document.getElementById("dealsButton").addEventListener("click", (event) => {
  const nextDealsState = !dealsOnly;
  setView("Explore");
  dealsOnly = nextDealsState;
  event.currentTarget.classList.toggle("selected", dealsOnly);
  renderFoods();
  document.getElementById("foodGrid").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("dialogClose").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialogContent.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.cartAction) {
    const index = Number(button.dataset.index);
    cart[index].quantity += button.dataset.cartAction === "increase" ? 1 : -1;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateCartCount();
    showCart();
  } else if (button.dataset.dialogAction === "checkout") {
    lastOrder = cart.map((line) => ({ ...line }));
    cart.length = 0;
    updateCartCount();
    dialog.close();
    showToast("Order confirmed! Check Orders for your receipt.");
  } else if (button.dataset.dialogAction === "browse") {
    dialog.close();
    setView("Explore");
  } else if (button.dataset.dialogAction === "profile-message") showMessages();
});
dialogContent.addEventListener("submit", (event) => {
  if (event.target.id !== "messageForm") return;
  event.preventDefault();
  dialog.close();
  showToast("Message sent. FoodGo support will be in touch.");
});
dialogContent.addEventListener("change", (event) => {
  if (event.target.id === "themeSelect") {
    themeMode = event.target.value;
    document.body.dataset.theme = themeMode;
  }
  if (event.target.id === "calmToggle") {
    reduceMotion = event.target.checked;
    document.body.classList.toggle("reduce-motion", reduceMotion);
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("searchInput").focus();
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

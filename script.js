const THE_BODY = document.querySelector("body");
const THEME_SWITCHER = document.getElementById("themeSwitcher");
const THEME_IMG = THEME_SWITCHER.querySelector("img");
const FORM = document.querySelector("FORM");
const INPUT = FORM.querySelector("INPUT");
const TODO_LIST = document.querySelector(".todo ul");
const ITEMS_LEFT_ELEM = document.getElementById("itemsLeft");
const CLEAR_COMPLETED_BTN = document.getElementById("clearCompleted");
const ASIDE = document.querySelector("aside");
const filters = document.querySelector(".filters");

let list = [];
let checkedList = [];

let filterContainer;
let activeFilter;
let completedFilter;
let allFilter;

resize();
setTheme();
window.addEventListener("resize", () => resize());
if (localStorage.getItem("list")) {
  list = JSON.parse(localStorage.getItem("list"));
  list.forEach((item) => createNewItem(item.value, item.checked));
}

THEME_SWITCHER.addEventListener("click", (e) => {
  if ([...THE_BODY.classList].includes("light"))
    localStorage.setItem("theme", "dark");
  else localStorage.setItem("theme", "light");
  setTheme();
});

FORM.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!list) list = [{ value: INPUT.value, checked: false }];
  else if (list) list.push({ value: INPUT.value, checked: false });
  setList();
  createNewItem(INPUT.value);

  INPUT.value = "";
});

new Sortable(TODO_LIST, { animation: 350 });

function createNewItem(val, checked = false) {
  const listItem = document.createElement("li");
  listItem.setAttribute("draggable", "true");
  listItem.classList.add("main-item", "flex");
  if (checked) listItem.classList.add("checked");
  listItem.innerHTML = `<button type="button" class="do" aria-label="check this item"></button>
  <p>${val}</p>
  <button type="button" class="delete" aria-label="delete this item">
    <img src="./images/icon-cross.svg" alt="delete" />
  </button>`;
  TODO_LIST.appendChild(listItem);

  listItem.addEventListener("drop", () => {
    list = [...getListItems()].map((item) => {
      const newItem = {
        value: item.innerText,
        checked: [...item.classList].includes("checked"),
      };
      return newItem;
    });
    setList();
  });

  setAndCallFilters();
  if ([...completedFilter.classList].includes("active"))
    listItem.classList.replace("flex", "invisible");

  let itemsLeft = 0;
  findItemsLeft();

  const checkBtn = listItem.querySelector(".do");
  checkBtn.addEventListener("click", () => {
    const index = list.findIndex((item) => item.value === listItem.innerText);
    if (![...listItem.classList].includes("checked")) {
      list[index].checked = true;
      listItem.classList.add("checked");
      if ([...activeFilter.classList].includes("active"))
        listItem.classList.replace("flex", "invisible");
    } else if ([...listItem.classList].includes("checked")) {
      list[index].checked = false;
      listItem.classList.remove("checked");
      if ([...completedFilter.classList].includes("active"))
        listItem.classList.replace("flex", "invisible");
    }
    setList();
    findItemsLeft();
  });

  const deleteBtn = listItem.querySelector(".delete");
  deleteBtn.addEventListener("click", () => {
    const index = list.findIndex((item) => item.value === listItem.innerText);
    list.splice(index, 1);
    setList();
    listItem.remove();
    findItemsLeft();
  });

  listItem.addEventListener("mouseover", () =>
    listItem.querySelector(".delete").classList.add("visible")
  );
  listItem.addEventListener("mouseleave", () =>
    listItem.querySelector(".delete").classList.remove("visible")
  );

  function findItemsLeft() {
    itemsLeft = list.filter((item) => !item.checked).length;
    ITEMS_LEFT_ELEM.innerText = itemsLeft;
  }
}

allFilter.addEventListener("click", () => {
  getListItems().forEach((item) => item.classList.replace("invisible", "flex"));
  addActiveClass(allFilter);
});
completedFilter.addEventListener("click", () =>
  filter("flex", "invisible", completedFilter)
);

activeFilter.addEventListener("click", () =>
  filter("invisible", "flex", activeFilter)
);

CLEAR_COMPLETED_BTN.addEventListener("click", () => {
  TODO_LIST.innerHTML = "";
  list = list.filter((item) => !item.checked);
  setList();
  list.forEach((item) => createNewItem(item.value, item.checked));
});

function resize() {
  const mediaQuery = window.matchMedia("(min-width: 600px)");
  const filters = document.querySelector(".filters");
  if (mediaQuery.matches) {
    filters.classList.replace("invisible", "visible");
    ASIDE.classList.replace("flex", "invisible");
    filterContainer = filters;
  } else {
    filters.classList.replace("visible", "invisible");
    ASIDE.classList.replace("invisible", "flex");
    filterContainer = ASIDE;
  }
}

function setList() {
  localStorage.setItem("list", JSON.stringify(list));
}

function getListItems() {
  const listItems = TODO_LIST.querySelectorAll("li");
  return listItems;
}

function filter(addClass, removeClass, element) {
  const listItems = getListItems();
  listItems.forEach((item) => {
    [...item.classList].includes("checked")
      ? item.classList.replace(removeClass, addClass)
      : item.classList.replace(addClass, removeClass);
  });
  addActiveClass(element);
}

function addActiveClass(element) {
  const filterBtns = [allFilter, completedFilter, activeFilter];
  filterBtns.forEach((btn) => btn.classList.remove("active"));
  element.classList.add("active");
}

function setTheme() {
  const theme = () => {
    return localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "light";
  };
  THE_BODY.className = "";
  THE_BODY.classList.add(theme());
  const LIGHT_IMG_SRC = "./images/icon-moon.svg";
  const DARK_IMG_SRC = "./images/icon-sun.svg";
  if (theme() === "dark") THEME_IMG.src = DARK_IMG_SRC;
  else if (theme() === "light") THEME_IMG.src = LIGHT_IMG_SRC;
}
function setAndCallFilters() {
  allFilter = filterContainer.querySelector("[data-filter='all']");
  activeFilter = filterContainer.querySelector("[data-filter='active']");
  completedFilter = filterContainer.querySelector("[data-filter='completed']");
}

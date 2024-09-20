//TwitterWidgets
function callTwitterWidgetsScript() {
  var script = document.createElement("script");
  script.src = "https://platform.twitter.com/widgets.js";
  script.charset = "utf-8";
  script.async = true;
  document.head.appendChild(script);
}

var curretPage = 0;
var totalPage = 10;
var selectedPage = "";

// api for dynamic menu items[Menu and SubMenu]
const getMenuList = () => {
  fetch(`/getHeading`)
    .then((response) => response.json())
    .then((menuData) => {
      const categories = []; // Store categories and their subcategories

      // Organize data into categories and subcategories
      menuData.forEach((item) => {
        if (item.parentID === 0) {
          categories[item.id] = { name: item.name, subcategories: [] };
        } else {
          categories[item.parentID].subcategories.push(item);
        }
      });
      categories.reverse();
      // Insert the dynamic list items after the "Home" menu item
      const menuContainer = document.querySelector(".menus");
      const homeMenuItem = menuContainer.querySelector(".menu_item");

      for (const categoryId in categories) {
        const category = categories[categoryId];

        const li = document.createElement("li");
        li.className =
          category.subcategories.length > 0 ? "menu_item has-sub" : "menu_item";

        const a = document.createElement("a");
        a.href = "#";
        a.className = "menu_link";
        a.textContent = category.name;

        li.appendChild(a);

        if (category.subcategories.length > 0) {
          const subMenuUl = document.createElement("ul");
          subMenuUl.className = "menu-sub menu-drop";
          subMenuUl.id = categoryId;

          category.subcategories.forEach((subCategory) => {
            const subLi = document.createElement("li");
            const subA = document.createElement("a");
            subA.href = "#";
            subA.className = "menu_link";
            subA.textContent = subCategory.name;
            subA.onclick = () => redirectTo(subCategory.name);

            subLi.appendChild(subA);
            subMenuUl.appendChild(subLi);
          });

          li.appendChild(subMenuUl);
        }

        menuContainer.insertBefore(li, homeMenuItem.nextSibling);
      }
    })
    .catch((err) => console.error(err));
};

//api for fetch  crypto gods tweets based on name means username
const getDataByUsername = (name, reset = false) => {
  let container = document.querySelector(".grid-container");
  if (reset) {
    curretPage = 0;
    container.innerHTML = "";
  }
  curretPage++;
  if (curretPage <= totalPage) {
    let hrefValues = [];
    const type = window.apiType;
    fetch(`/getsCryptoGodsUrl?username=${name}&page=${curretPage}`)
      .then((response) => response.json())
      .then((data) => {
        hrefValues = data.urls;
        totalPage = data.totalPages;
        for (let element = 0; element < hrefValues.length; element++) {
          let div = document.createElement("div");
          let blockquote = document.createElement("blockquote");

          blockquote.className = "twitter-tweet";
          let link = document.createElement("a");
          link.href = hrefValues[element];
          // console.log(element, link);
          blockquote.appendChild(link);
          div.appendChild(blockquote);
          container.appendChild(div);
        }

        callTwitterWidgetsScript();
      })
      .then(() => {
        scrollByTenPixels();
        setTimeout(() => {
          window.isFetch = false;
        }, 5000);
      })
      .catch((err) => console.error(err));
  }
};

//Home page api for fetch all tweets
const geturldata = async (reset = false) => {
  let container = document.querySelector(".grid-container");
  if (reset) {
    curretPage = 0;
    container.innerHTML = "";
  }
  curretPage++;
  if (curretPage <= totalPage) {
    let hrefValues = [];
    const type = window.apiType;

    await fetch(`/getUrl?page=${curretPage}`)
      .then((response) => response.json())
      .then((data) => {
        hrefValues = data.urls;
        totalPage = data.totalPages;
        // console.log(data);
        // console.log({ totalPage });
        // Loop through the href values and add them dynamically
        for (let i = 0; i < hrefValues.length; i++) {
          // Create a new <blockquote> element

          var div = document.createElement("div");
          var blockquote = document.createElement("blockquote");
          blockquote.className = "twitter-tweet";

          // Create a new <a> element
          var link = document.createElement("a");

          // Set the href attribute
          link.href = hrefValues[i];
          // console.log(i, link);
          // Append the <a> element to the <blockquote> element
          blockquote.appendChild(link);

          // Append the <blockquote> element to the container
          div.appendChild(blockquote);
          container.appendChild(div);
        }
        callTwitterWidgetsScript();
        scrollByTenPixels();
        setTimeout(() => {
          window.isFetch = false;
        }, 5000);
      })
      .catch((err) => console.error(err));
  }
};
function scrollByTenPixels() {
  window.scrollBy(0, -40); // Scroll up by 10 pixels
}

//ScrolledToBottom of page
function isScrolledToBottom() {
  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  var scrollHeight = document.documentElement.scrollHeight;
  var clientHeight = document.documentElement.clientHeight;
  return scrollTop + clientHeight >= scrollHeight;
}

//on scrool load new page
window.onscroll = async function () {
  if (isScrolledToBottom() && !window.isFetch) {
    window.isFetch = true;
    console.log("scroll", selectedPage);
    document.getElementById("contentLoader").style.display = "block";
    if (selectedPage === "urldata") {
      await geturldata();
    } else {
      await getDataByUsername(selectedPage);
    }
    setTimeout(() => {
      document.getElementById("contentLoader").style.display = "none";
    }, 5000);
  }

  // NO more data logic
  if (curretPage > totalPage) {
    document.getElementById("nomore").style.display = "block";
  }
};

// home page api call
const homePage = () => {
  const newUrl = window.location.pathname;
  history.pushState({}, document.title, newUrl);
  selectedPage = "urldata";
  geturldata(true);
};
window.onload = async () => {
  getMenuList();
  window.apiType = 1;
  const homepath = ["/", "/index.html", "/index.html#"];
  const urlParams = new URLSearchParams(window.location.search);
  const currentURL = window.location.pathname;
  const name = urlParams.get("page");
  document.getElementById("nomore").style.display = "none";
  console.log(homepath.includes(currentURL) && name === null);
  console.log(homepath.includes(currentURL));
  console.log(name);
  console.log(currentURL);
  console.log(selectedPage);
  if (homepath.includes(currentURL) && name === null) {
    selectedPage = "urldata";
    await geturldata(true);
  } else {
    selectedPage = name;
    getDataByUsername(name);
    // getDataByUsername(`/getsCryptoGodsUrl?username=${name}&page=${curretPage}`)
  }
};

//  Replies button code based on type =1 or type =2 start here:--

// const checkbox = document.getElementById("themeToggle");
// checkbox.addEventListener("change", async function () {
//   window.isChecked = checkbox.checked;
//   if (window.isChecked) {
//     window.apiType = 2;
//   } else {
//     window.apiType = 1;
//   }
//   document.getElementById("contentLoader").style.display = "block";
//   if (selectedPage == "urldata") {
//     await geturldata(true);
//   } else {
//     getDataByUsername(selectedPage, true);
//   }
//   setTimeout(() => {
//     document.getElementById("contentLoader").style.display = "none";
//   }, 5000);
//   console.log("Checkbox state:", window.isChecked);
// });

//  Replies button code end here

//redirectTo homepage
function redirectTo(name) {
  window.location.href = `index.html?page=${name}`;
}

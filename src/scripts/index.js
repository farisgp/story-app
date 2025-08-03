import "../styles/styles.css";

import App from "./pages/app";
import { registerServiceWorker } from './utils/index';
import { getActiveRoute } from "./routes/url-parser";
import { getToken } from "../scripts/pages/auth/auth";
import { removeToken } from "./data/api";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      skipLink.blur();

      mainContent.focus();
      mainContent.scrollIntoView();
    });
  }

  const userToken = getToken();
  const activePath = getActiveRoute();

  if (!userToken && activePath !== "/login" && activePath !== "/register") {
    window.location.hash = "#/login";
  } else if (
    userToken &&
    (activePath === "/login" || activePath === "/register")
  ) {
    window.location.hash = "#/";
  } else {
    await app.renderPage();
  }

  await registerServiceWorker();

  window.addEventListener("hashchange", async () => {
    const updatedUserToken = getToken();
    const currentActivePath = getActiveRoute();

    if (
      !updatedUserToken &&
      currentActivePath !== "/login" &&
      currentActivePath !== "/register"
    ) {
      window.location.hash = "#/login";
    } else if (
      updatedUserToken &&
      (currentActivePath === "/login" || currentActivePath === "/register")
    ) {
      window.location.hash = "#/";
    } else {
      await app.renderPage();
    }
  });


  console.log('Berhasil mendaftarkan service worker.');
});

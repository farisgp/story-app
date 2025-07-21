import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from '../utils';
import { getToken, removeToken } from "../pages/auth/auth";
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPageInstance = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupNavigation() {
    const logoutButton = document.querySelector("#logoutButton");
    if (logoutButton) {
      logoutButton.removeEventListener("click", this._handleLogout);
      logoutButton.addEventListener("click", this._handleLogout);
    }

    const addStoryButton = document.querySelector("#addStoryButton");
    if (addStoryButton) {
      addStoryButton.removeEventListener("click", this._handleAddStory);
      addStoryButton.addEventListener("click", this._handleAddStory);
    }

    const subscribeButton = document.querySelector("#subscribe-button");
    if (subscribeButton) {
      subscribeButton.removeEventListener("click", this._handleSubscribe);
      subscribeButton.addEventListener("click", this._handleSubscribe);
    }

    // const favoriteButton = document.querySelector("#favorite");
    // if (favoriteButton) {
    //   favoriteButton.removeEventListener("click", this._handleArcStory);
    //   favoriteButton.addEventListener("click", this._handleArcStory);
    // }

    this.#setupPushNotification();
    this._updateNavigationVisibility();
  }

  _handleSubscribe = (event) => {
    event.preventDefault();
    subscribe();
    this.#setupPushNotification();
  };

  _handleUnsubscribe = (event) => {
    event.preventDefault();
    unsubscribe();
    this.#setupPushNotification();
  };

  _handleLogout = (event) => {
    event.preventDefault();
    removeToken();
    window.location.hash = "#/login";
  };

  _handleAddStory = (event) => {
    event.preventDefault();
    window.location.hash = "#/add-story";
  };

  // _handleArcStory = (event) => {
  //   event.preventDefault();
  //   window.location.hash = "#/favorite";
  // };

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      const unsubscribeBtn = document.getElementById('unsubscribe-button');
      unsubscribeBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        await unsubscribe();
        await this.#setupPushNotification(); // Refresh tombol
      });
    } else {
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      const subscribeBtn = document.getElementById('subscribe-button');
      subscribeBtn?.addEventListener('click', async (event) => {
        event.preventDefault();
        await subscribe();
        await this.#setupPushNotification(); // Refresh tombol
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if (
      this.#currentPageInstance &&
      typeof this.#currentPageInstance.beforeRender === "function"
    ) {
      await this.#currentPageInstance.beforeRender();
    }

    this.#currentPageInstance = page;

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        this._setupNavigation();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._setupNavigation();
    }

    this._updateNavigationVisibility();
  }

  _updateNavigationVisibility() {
    const userToken = getToken();
    const authenticatedLinks = document.querySelectorAll(".authenticated");
    const guestLinks = document.querySelectorAll(".guest");

    if (userToken) {
      authenticatedLinks.forEach((link) => (link.style.display = "block"));
      guestLinks.forEach((link) => (link.style.display = "none"));
    } else {
      authenticatedLinks.forEach((link) => (link.style.display = "none"));
      guestLinks.forEach((link) => (link.style.display = "block"));
    }
  }
}

export default App;

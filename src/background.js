import "@babel/polyfill";

let AppInitState = 0; // it means app is off on startup

/**
 * Main extension functionality
 *
 * @class Main
 */
class Main {
  constructor() {}
  popUpClickSetup() {
    chrome.browserAction.onClicked.addListener((tab) => {
      if (this.toggleApp()) {
      } else {
        this.stopApp();
      }
    });
  }

  /**
   * toggle app
   *
   * @method
   * @memberof Main
   */
  toggleApp = () => {
    AppInitState = AppInitState ? 0 : 1;

    return AppInitState;
  };

  /**
   * stop app
   *
   * @method
   * @memberof Main
   */
  stopApp = () => {
    AppInitState = 0;
  };
}

const onPartyStarted = ({ payload, sendResponse }) => {
  chrome.storage.local.set({ party: payload });

  chrome.tabs.executeScript({
    file: "content_script.bundle.js",
  });
  sendResponse && sendResponse(true);
};

const onLeaveParty = ({ payload, sendResponse }) => {
  chrome.storage.local.remove("party");

  sendResponse(true);
};

const MESSAGE_HANDLERS = {
  PARTY_STARTED: onPartyStarted,
  LEAVE_PARTY: onLeaveParty,
};

chrome.runtime.onMessage.addListener(function (
  { type, payload },
  sender,
  sendResponse
) {
  const fun = MESSAGE_HANDLERS[type];
  if (fun) {
    fun({ payload, sendResponse });
  }
});

// on loading tab
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tab.active) {
    const url = new URL(tab.url);
    const playlistId = url.searchParams.get("playlistPartyId");

    if (playlistId) {
      onPartyStarted({ payload: playlistId });
    } else {
      chrome.storage.local.get(["party"], function (result) {
        if (result?.party) {
          // start content script when page is loaded and we have a party
          chrome.tabs.executeScript({
            file: "content_script.bundle.js",
          });
        }
      });
    }
  }
});

import "@babel/polyfill";
import { client } from "./ConnectBackend";
import { JOIN_PARTY, PLAYLIST_UPDATED, LEAVE_PARTY } from "./gql";

let AppInitState = 0; // it means app is off on startup
let partyTabId = null;

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

const showPartyConsole = ({ tabId }) => {
  chrome.tabs.executeScript(tabId, {
    file: "content_script.bundle.js",
  });
};

const onPartyStarted = ({ payload, sendResponse, tabId }) => {
  chrome.storage.local.set({ party: { ...payload, admin: true } });
  showPartyConsole({ tabId });
  sendResponse && sendResponse(true);
};

const onPartyJoined = async ({ payload, sendResponse, tabId }) => {
  if (payload) {
    chrome.storage.local.set({ party: payload });
    handleTabLoad({ tabId, party: payload });
  }
};

const handleTabLoad = ({ tabId, party }) => {
  if (partyTabId === tabId) {
    handlePlaylistUpdate(party.playlist, tabId);
  }
  if (!partyTabId) {
    partyTabId = tabId;
    handlePlaylistUpdate(party.playlist, partyTabId);
    client
      .subscribe({
        query: PLAYLIST_UPDATED,
        variables: { id: party.playlist.id },
      })
      .subscribe({
        next: ({ data }) => {
          const playlist = data?.playlistUpdated;
          if (playlist) {
            handlePlaylistUpdate(playlist, tabId);
          }
        },
      });
  }
};

const handlePlaylistUpdate = ({ tracks, currentIndex }, tabId) => {
  const track = tracks[currentIndex];
  if (track) {
    chrome.tabs.query({ url: track.url }, (tabs) => {
      if (!tabs.length) {
        chrome.tabs.update(tabId, { url: track.url });
      }
    });
  }
};

const onLeaveParty = ({ payload, tabId, sendResponse }) => {
  chrome.storage.local.get(["party"], async (result) => {
    if (result?.party) {
      chrome.storage.local.remove("party");
      partyTabId = null;
      await client.mutate({
        mutation: LEAVE_PARTY,
        variables: {
          id: result.party.playlist.id,
          user: result.party.user.id,
        },
      });
      chrome.tabs.reload(tabId);
      sendResponse(true);
    }
  });
};

const MESSAGE_HANDLERS = {
  PARTY_STARTED: onPartyStarted,
  LEAVE_PARTY: onLeaveParty,
  JOIN_PARTY: onPartyJoined,
};

chrome.runtime.onMessage.addListener(function (
  { type, payload, ...rest },
  sender,
  sendResponse
) {
  const fun = MESSAGE_HANDLERS[type];
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (fun) {
      fun({ payload, sendResponse, tabId: sender.tab?.id || tabs[0].id });
    }
  });
});

// on loading tab
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    const url = new URL(tab.url);
    if (url.host.includes("youtube")) {
      const playlistId = url.searchParams.get("playlistPartyId");

      if (playlistId) {
        showPartyConsole({ tabId });
      } else {
        chrome.storage.local.get(["party"], function (result) {
          if (result?.party) {
            // start content script when page is loaded and we have a party
            showPartyConsole({ tabId });
            handleTabLoad({ party: result.party, tabId });
          }
        });
      }
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === partyTabId) {
    partyTabId = null;
  }
});

import "@babel/polyfill";
import { client } from "./ConnectBackend";
import { JOIN_PARTY } from "./gql";

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

const showPartyConsole = () => {
  chrome.tabs.executeScript({
    file: "content_script.bundle.js",
  });
};

const onPartyStarted = ({ payload, sendResponse }) => {
  chrome.storage.local.set({ party: payload });
  showPartyConsole();
  sendResponse && sendResponse(true);
};

const onPartyJoined = async ({ playlistId }) => {
  // get party
  const { data } = await client.mutate({
    mutation: JOIN_PARTY,
    variables: { id: playlistId },
  });
  const party = data?.joinParty;

  // redirect if we haven't redirected before
  if (party) {
    const { tracks, currentIndex } = party;
    const track = tracks[currentIndex];

    console.log({ track, party, currentIndex, tracks });

    if (track) {
      chrome.tabs.query({ url: track.url }, (tabs) => {
        if (!tabs.length) {
          chrome.tabs.update({ url: track.url });
        }
      });
    }

    showPartyConsole();
  }
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
    if (url.host.includes("youtube")) {
      const playlistId = url.searchParams.get("playlistPartyId");

      if (playlistId) {
        onPartyJoined({ playlistId });
      } else {
        chrome.storage.local.get(["party"], function (result) {
          if (result?.party) {
            // start content script when page is loaded and we have a party
            onPartyJoined({ playlistId: result?.party?.id });
          }
        });
      }
    }
  }
});

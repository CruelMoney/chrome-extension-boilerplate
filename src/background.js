import "@babel/polyfill";
import { client } from "./ConnectBackend";
import { JOIN_PARTY, PLAYLIST_UPDATED, LEAVE_PARTY, PLAYLIST } from "./gql";

let partyTabId = null;
let subscriber = null;

const showPartyConsole = ({ tabId }) => {
  browser.tabs.executeScript(tabId, {
    file: "content_script.bundle.js",
  });
  browser.tabs.insertCSS(tabId, { file: "content_script.css" });
};

const onPartyStarted = ({ payload, sendResponse, tabId }) => {
  browser.storage.local.set({ party: { ...payload, admin: true } });
  showPartyConsole({ tabId });
  sendResponse && sendResponse(true);
};

const onPartyJoined = async ({ payload, sendResponse, tabId }) => {
  if (payload) {
    browser.storage.local.set({ party: payload });
    handleTabLoad({ tabId, playlist: payload.playlist });
  }
};

const handleTabLoad = async ({ tabId, playlist }) => {
  if (partyTabId === tabId) {
    handlePlaylistUpdate(playlist, tabId);
  }
  if (!partyTabId) {
    partyTabId = tabId;
    handlePlaylistUpdate(playlist, partyTabId);
    subscriber = client
      .subscribe({
        query: PLAYLIST_UPDATED,
        variables: { id: playlist.id },
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
    browser.tabs.query({ url: track.url }, (tabs) => {
      if (!tabs.length) {
        browser.tabs.update(tabId, { url: track.url });
      }
    });
  }
};

const onLeaveParty = ({ payload, tabId, sendResponse }) => {
  return new Promise((resolve, reject) => {
    browser.storage.local.get(["party"], async (result) => {
      console.log({ result });
      if (result?.party) {
        browser.storage.local.remove("party");
        partyTabId = null;
        if (subscriber) {
          subscriber.unsubscribe();
        }
        await client.mutate({
          mutation: LEAVE_PARTY,
          variables: {
            id: result.party.playlist.id,
            user: result.party.user.id,
          },
        });

        if (sendResponse) {
          sendResponse(true);
        }
      }
      resolve();
    });
  });
};

const MESSAGE_HANDLERS = {
  PARTY_STARTED: onPartyStarted,
  LEAVE_PARTY: onLeaveParty,
  JOIN_PARTY: onPartyJoined,
};

browser.runtime.onMessage.addListener(function (
  { type, payload, ...rest },
  sender,
  sendResponse
) {
  const fun = MESSAGE_HANDLERS[type];
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (fun) {
      fun({ payload, sendResponse, tabId: sender.tab?.id || tabs[0].id });
    }
  });
});

// on loading tab
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "complete") {
    const url = new URL(tab.url);
    if (url.host.includes("youtube")) {
      browser.pageAction.show(tabId);

      browser.storage.local.get(["party"], async (result) => {
        const storedParty = result?.party;
        const playlistId = url.searchParams.get("playlistPartyId");

        if (!storedParty && playlistId) {
          showPartyConsole({ tabId });
          return;
        }
        if (storedParty) {
          if (playlistId && storedParty.playlist.id !== playlistId) {
            // joining a new party, so first leave this one
            await onLeaveParty({ tabId });
          }
          // start content script when page is loaded and we have a party
          let { data } = await client.query({
            query: PLAYLIST,
            variables: { id: storedParty.playlist.id },
          });

          if (data) {
            showPartyConsole({ tabId });
            handleTabLoad({ playlist: data.playlist, tabId });
          }
        }
      });
    } else {
      browser.pageAction.hide(tabId);
    }
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  if (tabId === partyTabId) {
    partyTabId = null;
    if (subscriber) {
      subscriber.unsubscribe();
    }
    // leave party
    onLeaveParty({ tabId });
  }
});

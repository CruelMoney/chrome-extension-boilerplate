import "@babel/polyfill";
import { client } from "./ConnectBackend";
import { JOIN_PARTY, PLAYLIST_UPDATED, LEAVE_PARTY, PLAYLIST } from "./gql";

let partyTabId = null;
let subscriber = null;

const showPartyConsole = ({ tabId }) => {
  chrome.tabs.executeScript(tabId, {
    file: "content_script.bundle.js",
  });
  chrome.tabs.insertCSS(tabId, { file: "content_script.css" });
};

const onPartyStarted = ({ payload, sendResponse, tabId }) => {
  chrome.storage.local.set({ party: { ...payload, admin: true } });
  showPartyConsole({ tabId });
  handleTabLoad({ tabId, playlist: payload.playlist });
  sendResponse && sendResponse(true);
};

const onPartyJoined = async ({ payload, sendResponse, tabId }) => {
  if (payload) {
    chrome.storage.local.set({ party: payload });
    handleTabLoad({ tabId, playlist: payload.playlist });
  }
};

const handleTabLoad = async ({ tabId, playlist }) => {
  console.log({ tabId, partyTabId });
  if (partyTabId === tabId) {
    handlePlaylistUpdate(playlist, tabId);
  }
  if (!partyTabId) {
    partyTabId = tabId;
    handlePlaylistUpdate(playlist, tabId);
    subscriber = client
      .subscribe({
        query: PLAYLIST_UPDATED,
        variables: { id: playlist.id },
      })
      .subscribe({
        next: ({ data }) => {
          console.log({ data });
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
      console.log({ tabs, track });
      if (!tabs.length) {
        console.log(track.url);
        chrome.tabs.update(tabId, { url: track.url });
      }
    });
  }
};

const onLeaveParty = ({ payload, tabId, sendResponse }) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["party"], async (result) => {
      console.log({ result });
      if (result?.party) {
        chrome.storage.local.remove("party");
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
chrome.webNavigation.onCompleted.addListener(function ({ url, tabId }) {
  console.log({ url });
  url = new URL(url);
  if (url.host.includes("youtube") || tabId === partyTabId) {
    chrome.storage.local.get(["party"], async (result) => {
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
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === partyTabId) {
    partyTabId = null;
    if (subscriber) {
      subscriber.unsubscribe();
    }
    // leave party
    onLeaveParty({ tabId });
  }
});

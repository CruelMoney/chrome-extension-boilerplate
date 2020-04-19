import { useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST, ADD_TRACK } from "../../gql";

const useGuestActions = ({ party }) => {
  const {
    id,
    tracks = [],
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    admin,
  } = party || {};

  useAddHandlersToButtons({ id });

  // update player to current playback state
  useEffect(() => {
    const video = document.querySelector("video");

    if (!admin && video && currentSongStartedTimestamp) {
      // we need to caluclate the current position
      const diffSeconds =
        (new Date().getTime() - currentSongStartedTimestamp) / 1000;
      const currentPosition = currentSongPlaybackSecond + diffSeconds + 1;

      video.currentTime = currentPosition;
    }
  }, [currentSongPlaybackSecond, currentSongStartedTimestamp, admin]);
};

const useAddHandlersToButtons = ({ id }) => {
  const [addTrack] = useMutation(ADD_TRACK, { onError: console.log });

  const addListenersToRoot = useCallback(() => {
    console.log("adding listeners");
    const listPreviews = document.querySelectorAll("ytd-video-renderer");
    const smallPreviews = document.querySelectorAll(
      "ytd-compact-video-renderer"
    );
    const videos = [...listPreviews, ...smallPreviews];

    videos.forEach((node) => {
      node.onclick = () => {
        setTimeout(() => {
          const url = node.querySelector("a").getAttribute("href");
          const name = node.querySelector("#video-title").getAttribute("title");
          const popup = document.querySelector("ytd-popup-container");
          const playlistButton = popup.querySelector('[role="menuitem"]');
          const buttonText = popup.querySelector("yt-formatted-string");
          const buttonIcon = popup.querySelector("yt-icon");
          buttonText.innerHTML = "Add to party playlist";
          const clickHandler = (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            addTrack({
              variables: { id, url: "https://www.youtube.com" + url, name },
            });
          };
          buttonText.onclick = clickHandler;
          buttonIcon.onclick = clickHandler;
        }, 100);
      };
    });
  }, [id, addTrack]);

  // add listeners to addd track buttons
  useEffect(() => {
    const observer = new MutationObserver(addListenersToRoot);

    const addListeners = () => {
      const listElement = document.querySelector("ytd-search");
      const compactElement = document.querySelector(
        "ytd-compact-radio-renderer"
      );
      if (listElement) {
        observer.observe(listElement, { childList: true, subtree: true });
      }
      if (compactElement) {
        observer.observe(compactElement.parentElement, { childList: true });
      }
    };
    addListeners();
    window.addEventListener("popstate", addListeners);
    return () => {
      window.removeEventListener("popstate", addListeners);
      observer.disconnect();
    };
  }, [addListenersToRoot]);
};

export default useGuestActions;

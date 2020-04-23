import { useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST, ADD_TRACK } from "../../gql";
import { ToastsStore } from "react-toasts";

const useGuestActions = ({ playlist, userId }) => {
  const {
    id,
    tracks = [],
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    admin,
  } = playlist || {};

  useAddHandlersToButtons({ id, userId });

  // update player to current playback state
  useEffect(() => {
    const video = document.querySelector("video");
    let hasUpdated = false;

    if (video) {
      const updateToCurrentTime = ({ initial }) => {
        if (!admin && video && currentSongStartedTimestamp && !hasUpdated) {
          // we need to caluclate the current position
          const diffSeconds =
            (new Date().getTime() - currentSongStartedTimestamp) / 1000;
          const currentPosition = currentSongPlaybackSecond + diffSeconds;

          video.currentTime = currentPosition;

          if (!initial) {
            hasUpdated = true;
          }
        }
      };

      // we call it again here to perfect it after a load
      video.addEventListener("playing", updateToCurrentTime);
      updateToCurrentTime({ initial: true });

      return () => video.removeEventListener("playing", updateToCurrentTime);
    }
  }, [currentSongPlaybackSecond, currentSongStartedTimestamp, admin]);
};

const getNodeTrackTitle = (node) => {
  const parent = node.closest("#dismissable") || node.closest("#content");
  if (parent) {
    const titleNode =
      parent.querySelector("#video-title") ||
      parent.querySelector("#video-title-link");
    if (titleNode) {
      return titleNode.innerText;
    }
  }

  return null;
};

const useAddHandlersToButtons = ({ id, userId }) => {
  const [addTrack] = useMutation(ADD_TRACK, { onError: console.log });

  const addListenersToRoot = useCallback(() => {
    const links = document.querySelectorAll("[href^='/watch']");
    links.forEach((node) => {
      node.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        try {
          const url = node.getAttribute("href");
          if (url) {
            let urlObject = new URL("https://www.youtube.com" + url);
            const videoId = urlObject.searchParams.get("v");
            urlObject = new URL("https://www.youtube.com/watch");
            urlObject.searchParams.set("v", videoId);

            const name = getNodeTrackTitle(node);

            console.log(urlObject.href);

            addTrack({
              variables: {
                id,
                url: urlObject.href,
                name,
                user: userId,
              },
            });
            ToastsStore.success("Added " + name);
          } else {
            throw new Error("Url not found for track");
          }
        } catch (error) {
          console.log(error);
          ToastsStore.warning("Couldn't add track");
        }
      };
    });
  }, [id, addTrack, userId]);

  // add listeners to addd track buttons
  useEffect(() => {
    const observer = new MutationObserver(addListenersToRoot);
    const addListeners = () => {
      observer.observe(document.body, { childList: true, subtree: true });
    };
    addListeners();
    addListenersToRoot();
    return () => {
      observer.disconnect();
    };
  }, [addListenersToRoot]);
};

export default useGuestActions;

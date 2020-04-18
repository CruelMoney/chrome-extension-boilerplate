import { useEffect } from "react";
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
  const [addTrack] = useMutation(ADD_TRACK);

  // add listeners to addd track buttons
  useEffect(() => {
    const buttons = document.querySelectorAll(".add-party-playlist-button");
    buttons.forEach((button) => {
      const url = button.getAttribute("data-url");
      const name = button.getAttribute("data-name");
      button.onclick = () => addTrack({ variables: { id, url, name } });
    });
  }, []);
};

export default useGuestActions;

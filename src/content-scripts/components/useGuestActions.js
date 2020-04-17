import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useGuestActions = ({ party }) => {
  const {
    tracks = [],
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    admin,
  } = party || {};

  // redirect to correct song
  useEffect(() => {
    const track = tracks[currentIndex];
    if (track && window.location.href !== track.url) {
      window.location.href = track.url;
    }
  }, [tracks, currentIndex]);

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

export default useGuestActions;

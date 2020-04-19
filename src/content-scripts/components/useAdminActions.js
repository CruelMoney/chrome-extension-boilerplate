import { useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = ({ party }) => {
  const [updatePlaylist, { error }] = useMutation(UPDATE_PLAYLIST);
  const { id, admin, currentIndex, currentSongStartedTimestamp } = party || {};

  const updatePlayerState = useCallback(() => {
    const vid = document.querySelector("video");
    const currentSongStartedTimestamp = new Date().getTime();
    const currentSongPlaybackSecond = parseInt(vid.currentTime);

    updatePlaylist({
      variables: {
        id,
        currentIndex,
        currentSongStartedTimestamp,
        currentSongPlaybackSecond,
      },
    });
  }, [id, currentIndex]);

  const goToNextSong = useCallback(() => {
    const currentSongStartedTimestamp = new Date().getTime();
    console.log({ currentIndex });
    console.log("Going to next song", currentIndex + 1);
    updatePlaylist({
      variables: {
        id,
        currentIndex: currentIndex + 1,
        currentSongStartedTimestamp,
        currentSongPlaybackSecond: 0,
      },
    });
  }, [id, currentIndex]);

  // add listeners
  useEffect(() => {
    if (admin && id) {
      const video = document.querySelector("video");
      if (video) {
        video.addEventListener("play", updatePlayerState);
        video.addEventListener("ended", goToNextSong);

        return () => {
          video.removeEventListener("play", updatePlayerState);
          video.removeEventListener("ended", goToNextSong);
        };
      }
    }
  }, [id, admin, currentIndex]);
};

export default useAdminActions;

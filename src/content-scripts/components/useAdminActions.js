import { useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = ({ playlist, admin }) => {
  const [updatePlaylist, { error }] = useMutation(UPDATE_PLAYLIST);
  const { id, currentIndex, currentSongStartedTimestamp } = playlist || {};

  const updatePlayerState = useCallback(() => {
    const vid = document.querySelector("video");
    if (vid) {
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
    }
  }, [id, currentIndex]);

  const goToNextSong = useCallback(() => {
    const currentSongStartedTimestamp = new Date().getTime();
    updatePlaylist({
      variables: {
        id,
        currentIndex: currentIndex + 1,
        currentSongStartedTimestamp,
        currentSongPlaybackSecond: 0,
      },
    });
  }, [id, currentIndex]);

  useEffect(() => {
    if (id && !currentSongStartedTimestamp) {
      updatePlayerState();
    }
  }, [id, currentSongStartedTimestamp, updatePlayerState]);

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
  }, [id, admin, updatePlayerState]);
};

export default useAdminActions;

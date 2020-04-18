import { useEffect, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = ({ party }) => {
  const [updatePlaylist, { error }] = useMutation(UPDATE_PLAYLIST);
  const { id, admin, currentIndex } = party || {};

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

  // add listeners
  useEffect(() => {
    if (admin && id) {
      const video = document.querySelector("video");
      if (video) {
        video.addEventListener("seeked", updatePlayerState);
        video.addEventListener("ended", updatePlayerState);
        return () => {
          video.removeEventListener("seeked", updatePlayerState);
        };
      }
    }
  }, [id, admin]);
};

export default useAdminActions;

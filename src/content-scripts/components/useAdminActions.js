import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = ({ party }) => {
  const [updatePlaylist, { error }] = useMutation(UPDATE_PLAYLIST);
  const { id, admin } = party || {};

  useEffect(() => {
    if (admin && id) {
      const video = document.querySelector("video");
      const updatePlayerState = () => {
        const currentSongStartedTimestamp = new Date().getTime();
        const currentSongPlaybackSecond = parseInt(video.currentTime);

        updatePlaylist({
          variables: {
            id,
            currentSongStartedTimestamp,
            currentSongPlaybackSecond,
          },
        });
      };

      video.addEventListener("seeked", updatePlayerState);

      return () => {
        video.removeEventListener("seeked", updatePlayerState);
      };
    }
  }, [id, admin]);
};

export default useAdminActions;

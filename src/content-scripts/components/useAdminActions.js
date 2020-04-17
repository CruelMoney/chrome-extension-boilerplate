import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = ({ party }) => {
  const [updatePlaylist] = useMutation(UPDATE_PLAYLIST);

  const { id, admin } = party || {};

  useEffect(() => {
    if (admin && id) {
      const video = document.querySelector("video");
      video.addEventListener("seeked", (event) => {
        const currentSongStartedTimestamp = parseInt(Date.now());
        const currentSongPlaybackSecond = parseInt(video.currentTime);

        updatePlaylist({
          variables: {
            id,
            currentSongStartedTimestamp,
            currentSongPlaybackSecond,
          },
        });
      });
    }
  }, [id, admin]);
};

export default useAdminActions;

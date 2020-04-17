import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useAdminActions = () => {
  const [updatePlaylist] = useMutation(UPDATE_PLAYLIST);

  const init = ({ partyId }) => {
    const video = document.querySelector("video");

    video.addEventListener("seeked", (event) => {
      const currentSongStartedTimestamp = parseInt(Date.now());
      const currentSongPlaybackSecond = parseInt(video.currentTime);

      updatePlaylist({
        variables: {
          id: partyId,
          currentSongStartedTimestamp,
          currentSongPlaybackSecond,
        },
      });
    });
  };

  return [init];
};

export default useAdminActions;

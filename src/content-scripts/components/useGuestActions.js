import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useGuestActions = ({ party }) => {
  const video = document.querySelector("video");
  const { tracks = [], currentIndex } = party || {};

  // redirect to correct song
  useEffect(() => {
    const track = tracks[currentIndex];
    if (track && window.location.href !== track.url) {
      window.location.href = track.url;
    }
  }, [tracks, currentIndex]);

  // update player to current playback state
  const init = () => {};

  return [init];
};

export default useGuestActions;

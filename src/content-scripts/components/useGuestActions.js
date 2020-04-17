import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPDATE_PLAYLIST } from "../../gql";

const useGuestActions = () => {
  const video = document.querySelector("video");

  return [init];
};

export default useGuestActions;

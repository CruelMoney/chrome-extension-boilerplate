import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation, useSubscription, useQuery } from "@apollo/client";
import {
  JOIN_PARTY,
  PLAYLIST_UPDATED,
  REMOVE_TRACK,
  VOTE,
  REMOVE_VOTE,
  PLAYLIST,
} from "../../gql";
import useAdminActions from "./useAdminActions";
import useGuestActions from "./useGuestActions";
import JoinParty from "./JoinParty";
import SideBar from "./SideBar";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <div id="party-sidebar">
          <DataWrapper />
        </div>
      </ConnectBackend>
    );
  }
}

const DataWrapper = () => {
  const [party, setParty] = useState();

  useEffect(() => {
    chrome.storage.local.get(["party"], function (result) {
      setParty(result.party);
    });
  }, []);

  if (true) {
    return <JoinParty onJoined={setParty} />;
  }

  return <SideBar party={party} />;
};

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
        <div style={styles.sideBar}>
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

  if (!party) {
    return <JoinParty onJoined={setParty} />;
  }

  return <SideBar party={party} />;
};

const styles = {
  sideBar: {
    position: "fixed",
    right: 0,
    top: 0,
    height: "100vh",
    width: "400px",
    backgroundColor: "#fff",
    color: "#111",
    padding: "20px",
    paddingTop: "60px",
    boxShadow: `
    0 2.8px 2.2px rgba(0, 0, 0, 0.02),
    0 6.7px 5.3px rgba(0, 0, 0, 0.028),
    0 12.5px 10px rgba(0, 0, 0, 0.035),
    0 22.3px 17.9px rgba(0, 0, 0, 0.042),
    0 41.8px 33.4px rgba(0, 0, 0, 0.05),
    0 100px 80px rgba(0, 0, 0, 0.07)
    `,
  },
};

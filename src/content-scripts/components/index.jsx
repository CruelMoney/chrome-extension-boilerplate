import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation, useSubscription } from "@apollo/client";
import { JOIN_PARTY, PLAYLIST_UPDATED } from "../../gql";
import useAdminActions from "./useAdminActions";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <DataWrapper />
      </ConnectBackend>
    );
  }
}

const DataWrapper = () => {
  const [party, setParty] = useState();
  const [initAdmin] = useAdminActions();

  useEffect(() => {
    chrome.storage.local.get(["party"], function (result) {
      setParty(result.party);

      if (result?.party?.admin) {
        initAdmin({ partyId: result.party.id });
      }
    });
  }, []);

  if (!party) {
    return null;
  }

  return <InnerContent party={party} />;
};

const InnerContent = ({ party }) => {
  const [join, { data: queryData }] = useMutation(JOIN_PARTY);
  const { data: subscriptionData, error } = useSubscription(PLAYLIST_UPDATED, {
    variables: { id: party.id },
  });

  const data = {
    ...queryData?.joinParty,
    ...subscriptionData?.playlistUpdated,
  };
  const {
    tracks = [],
    id,
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
  } = data;

  useEffect(() => {
    join({ variables: { id: party.id } });
  }, []);

  useEffect(() => {
    if (id) {
      const track = tracks[currentIndex];
      if (track && window.location.href !== track.url) {
        window.location.href = track.url;
      }
    }
  }, [currentIndex, id]);

  return (
    <div style={styles.sideBar}>
      Hi from content script
      {id && <LeavePartyButton />}
      <h3>{id}</h3>
      <h3>{currentIndex}</h3>
      <h3>{currentSongStartedTimestamp}</h3>
      <h3>{currentSongPlaybackSecond}</h3>
      {tracks?.length && <Tracks tracks={tracks} />}
    </div>
  );
};

const LeavePartyButton = () => {
  const leaveParty = () => {
    chrome.runtime.sendMessage({
      type: "LEAVE_PARTY",
    });
    window.location.reload();
  };

  return <button onClick={leaveParty}>Leave party</button>;
};

const Tracks = ({ tracks }) => {
  return (
    <div>
      <h2>Tracks</h2>

      <ul>
        {tracks.map((t, idx) => (
          <li key={idx}>{t.url}</li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  sideBar: {
    position: "fixed",
    right: 0,
    top: 0,
    height: "100vh",
    width: "430px",
    backgroundColor: "#fff",
    padding: "10px",
    paddingTop: "60px",
    boxShadow: `
      1.7px 0 2.2px rgba(0, 0, 0, 0.02),
      4px 0 5.3px rgba(0, 0, 0, 0.028),
      7.5px 0 10px rgba(0, 0, 0, 0.035),
      13.4px 0 17.9px rgba(0, 0, 0, 0.042),
      25.1px 0 33.4px rgba(0, 0, 0, 0.05),
      60px 0 80px rgba(0, 0, 0, 0.07)
    `,
  },
};

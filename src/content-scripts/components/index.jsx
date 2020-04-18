import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation, useSubscription } from "@apollo/client";
import { JOIN_PARTY, PLAYLIST_UPDATED, REMOVE_TRACK } from "../../gql";
import useAdminActions from "./useAdminActions";
import useGuestActions from "./useGuestActions";

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

  useEffect(() => {
    chrome.storage.local.get(["party"], function (result) {
      setParty(result.party);
    });
  }, []);

  if (!party) {
    return null;
  }

  return <InnerContent party={party} />;
};

const InnerContent = ({ party }) => {
  const [join, { data: queryData }] = useMutation(JOIN_PARTY, {
    variables: { user: party.user?.id },
  });
  const { data: subscriptionData } = useSubscription(PLAYLIST_UPDATED, {
    variables: { id: party.id },
  });
  const data = {
    ...party,
    ...queryData?.joinParty?.playlist,
    ...subscriptionData?.playlistUpdated,
    user: queryData?.joinParty?.user,
  };

  const {
    tracks = [],
    id,
    url,
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    admin,
    user,
    users,
  } = data;

  console.log({ users });

  useAdminActions({ party: data });
  useGuestActions({ party: data });
  useEffect(() => {
    join({ variables: { id: party.id } });
  }, []);

  useEffect(() => {
    if (id && queryData) {
      chrome.runtime.sendMessage({
        type: "JOIN_PARTY",
        payload: data,
      });
    }
  }, [id, queryData]);

  const currentTrack = tracks[currentIndex];
  const upcomingTracks = tracks.slice(currentIndex + 1);

  return (
    <div style={styles.sideBar}>
      Hi from content script
      {id && <LeavePartyButton />}
      <ReturnToPartyButton />
      <h3>{url}</h3>
      <h3>Admin: {admin ? "yes" : "no"}</h3>
      <h3>Current idx: {currentIndex}</h3>
      <h3>Current timestamp: {currentSongStartedTimestamp}</h3>
      <h3>Current seconds: {currentSongPlaybackSecond}</h3>
      <h3>User id: {user?.id}</h3>
      <CurrentTrack {...currentTrack}></CurrentTrack>
      {upcomingTracks?.length && (
        <Tracks admin={admin} tracks={upcomingTracks} playlistId={id} />
      )}
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

const ReturnToPartyButton = () => {
  // should only show if current song not playing.
  // and will redirect to the song that is currently playing

  // imagine they browse around to add new songs and then go back
  return <button>Return to party</button>;
};

const Tracks = ({ tracks, playlistId, admin }) => {
  return (
    <div>
      <h2>Upcoming tracks</h2>
      <ul>
        {tracks.map((t) => (
          <Track key={t.id} playlistId={playlistId} admin={admin} {...t} />
        ))}
      </ul>
    </div>
  );
};

const Track = ({ playlistId, url, id, name, admin, ...props }) => {
  const [remove] = useMutation(REMOVE_TRACK, {
    variables: { id, playlistId },
  });

  return (
    <li {...props}>
      {name || url}
      {admin && <button onClick={remove}>Remove</button>}
    </li>
  );
};

const CurrentTrack = ({ name }) => {
  return (
    <>
      <h2>Now playing</h2>
      <p style={styles.nowPlaying}>{name}</p>
    </>
  );
};

const styles = {
  nowPlaying: {
    fontSize: "2em",
  },
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

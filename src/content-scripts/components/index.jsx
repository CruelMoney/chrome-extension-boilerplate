import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation, useSubscription } from "@apollo/client";
import {
  JOIN_PARTY,
  PLAYLIST_UPDATED,
  REMOVE_TRACK,
  VOTE,
  REMOVE_VOTE,
} from "../../gql";
import useAdminActions from "./useAdminActions";
import useGuestActions from "./useGuestActions";
import JoinParty from "./JoinParty";

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

  return <InnerContent party={party} />;
};

const InnerContent = ({ party }) => {
  console.log({ party });
  const { data: subscriptionData } = useSubscription(PLAYLIST_UPDATED, {
    variables: { id: party.playlist.id },
  });

  const playlist = {
    ...party.playlist,
    ...subscriptionData?.playlistUpdated,
  };
  const { user } = party;

  const {
    tracks = [],
    id,
    url,
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    admin,
    users = [],
  } = playlist;

  console.log({ users, subscriptionData, playlist });

  useAdminActions({ playlist });
  useGuestActions({ playlist });

  const currentTrack = tracks[currentIndex];
  const upcomingTracks = tracks.slice(currentIndex + 1);

  return (
    <div>
      Hi from content script
      {id && <LeavePartyButton />}
      <ReturnToPartyButton />
      <h3>{url}</h3>
      <h3>Admin: {admin ? "yes" : "no"}</h3>
      <h3>Current idx: {currentIndex}</h3>
      <h3>Current timestamp: {currentSongStartedTimestamp}</h3>
      <h3>Current seconds: {currentSongPlaybackSecond}</h3>
      <h3>User id: {user?.id}</h3>
      <h2>Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name || u.id}</li>
        ))}
      </ul>
      <CurrentTrack {...currentTrack}></CurrentTrack>
      {upcomingTracks?.length && (
        <Tracks
          user={user}
          admin={admin}
          tracks={upcomingTracks}
          playlistId={id}
        />
      )}
    </div>
  );
};

const LeavePartyButton = () => {
  const leaveParty = () => {
    chrome.runtime.sendMessage({
      type: "LEAVE_PARTY",
    });
  };

  return <button onClick={leaveParty}>Leave party</button>;
};

const ReturnToPartyButton = () => {
  // should only show if current song not playing.
  // and will redirect to the song that is currently playing

  // imagine they browse around to add new songs and then go back
  return <button>Return to party</button>;
};

const Tracks = ({ tracks, user, playlistId, admin }) => {
  return (
    <div>
      <h2>Upcoming tracks</h2>
      <ul>
        {tracks.map((t) => (
          <Track
            key={t.id}
            playlistId={playlistId}
            user={user}
            admin={admin}
            {...t}
          />
        ))}
      </ul>
    </div>
  );
};

const Track = ({ playlistId, url, id, votes, name, user, admin, ...props }) => {
  const [remove] = useMutation(REMOVE_TRACK, {
    variables: { id, playlistId },
  });
  const [vote] = useMutation(VOTE, {
    variables: {
      trackId: id,
      user: user?.id,
    },
  });

  const [unvote] = useMutation(REMOVE_VOTE, {
    variables: {
      trackId: id,
      user: user?.id,
    },
  });
  const hasVoted = votes.some((v) => v?.user?.id === user?.id);

  return (
    <li style={styles.track} {...props}>
      <span>{votes.length} votes </span>
      {name || url}
      {admin && <button onClick={remove}>Remove</button>}
      <button onClick={hasVoted ? unvote : vote}>
        {hasVoted ? "Remove vote" : "Vote"}
      </button>
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
  track: {
    display: "flex",
  },
};

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

const SideBar = ({ party }) => {
  let { data } = useQuery(PLAYLIST, { variables: { id: party.playlist.id } });
  const { data: subscriptionData } = useSubscription(PLAYLIST_UPDATED, {
    variables: { id: party.playlist.id },
  });

  const { user, admin } = party;
  data = {
    ...data,
    ...subscriptionData,
  };
  const playlist = data?.playlist;

  useAdminActions({ playlist, admin });
  useGuestActions({ playlist });

  if (!playlist) {
    return null;
  }

  const {
    tracks = [],
    id,
    url,
    currentIndex,
    currentSongStartedTimestamp,
    currentSongPlaybackSecond,
    users = [],
  } = playlist;

  const currentTrack = tracks[currentIndex];
  const upcomingTracks = tracks.slice(currentIndex + 1);

  return (
    <div id={"side-bar-content"}>
      <div style={styles.topArea}>
        <h1>YouTube Party</h1>
        <label>
          Invitation link
          <input style={styles.input} value={url} />
        </label>
      </div>
      {id && <LeavePartyButton />}
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
  topArea: {
    borderBottom: "2px solid rgba(207, 215, 223, 0.25)",
    marginTop: "1em",
    paddingBottom: "1em",
    marginBottom: "1em",
  },
  input: {
    fontSize: "1em",
    color: "rgb(18, 43, 72)",
    height: "2.222em",
    webkitAppearance: "none",
    width: "100%",
    display: "block",
    fontWeight: "400",
    boxShadow: "none",
    textIndent: "9px",
    background: "rgb(246, 248, 249)",
    borderRadius: "0.222em",
    borderWidth: "initial",
    borderStyle: "none",
    borderColor: "initial",
    borderImage: "initial",
    outline: "none",
  },
  track: {
    display: "flex",
  },
};

export default SideBar;

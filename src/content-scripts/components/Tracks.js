import React from "react";
import { useMutation } from "@apollo/client";
import { REMOVE_TRACK, VOTE, REMOVE_VOTE } from "../../gql";

const UpvoteButton = ({ votes, hasVoted, ...props }) => {
  return (
    <button
      className={"upvote-button " + (hasVoted ? " active " : "")}
      {...props}
    >
      <span className="up-arrow" />
      <span>{votes?.length || 0}</span>
    </button>
  );
};

const Tracks = ({ tracks, user, playlistId, admin }) => {
  return (
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
  );
};

const Track = ({
  playlistId,
  url,
  addedBy,
  id,
  votes,
  name,
  user,
  admin,
  ...props
}) => {
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

  const thumbnail = `https://i.ytimg.com/vi/${url
    .split("watch?v=")
    .pop()}/default.jpg`;

  const isOwn = addedBy && user && user.id === addedBy.id;

  return (
    <li
      className={"row track" + (isOwn ? " is-owner " : "")}
      {...props}
      data-url={url}
    >
      <div className="row">
        <img className="thumbnail" src={thumbnail}></img>
        <p>{name || url}</p>

        <div className="remove-button-wrapper">
          <button className="remove-button primary-button" onClick={remove}>
            Remove
          </button>
        </div>
      </div>

      <UpvoteButton
        votes={votes}
        onClick={hasVoted ? unvote : vote}
        hasVoted={hasVoted}
      />
    </li>
  );
};

export const CurrentTrack = ({ name, url, votes, hasVoted }) => {
  const thumbnail = `https://i.ytimg.com/vi/${url
    .split("watch?v=")
    .pop()}/default.jpg`;

  return (
    <div className={"row track"}>
      <div className="row">
        <img className="thumbnail" src={thumbnail}></img>
        <p>{name || url}</p>
      </div>
      <UpvoteButton votes={votes} disabled hasVoted={hasVoted} />
    </div>
  );
};

export default Tracks;

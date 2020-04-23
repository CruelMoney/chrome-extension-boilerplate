import React, { useState, useEffect } from "react";
import { useTransition, animated } from "react-spring";
import { useMutation } from "@apollo/client";
import { REMOVE_TRACK, VOTE, REMOVE_VOTE } from "../../gql";
import useAdminActions from "./useAdminActions";
import { ToastsStore } from "react-toasts";

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
  let fullHeight = 0;

  const transitions = useTransition(
    tracks.map((data) => {
      return { ...data, y: (fullHeight += 65) - 65 };
    }),
    (d) => d.id,
    {
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y }) => ({ y, height: 65, opacity: 1 }),
      update: ({ y }) => ({ y, height: 65 }),
    }
  );

  return (
    <ul style={{ height: fullHeight }}>
      {transitions.map(({ item, props: { y, ...rest }, key }, index) => (
        <animated.div
          key={key}
          style={{
            position: "absolute",
            width: "100%",
            zIndex: tracks.length - index,
            transform: y.interpolate((y) => `translate3d(0,${y}px,0)`),
            ...rest,
          }}
        >
          <Track playlistId={playlistId} user={user} admin={admin} {...item} />
        </animated.div>
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

export const CurrentTrack = ({
  skipSong,
  name,
  addedBy,
  user,
  url,
  votes,
  hasVoted,
}) => {
  const thumbnail = `https://i.ytimg.com/vi/${url
    .split("watch?v=")
    .pop()}/default.jpg`;

  const isOwn = addedBy && user && user.id === addedBy.id;

  return (
    <div className={"row track is-owner"}>
      <div className="row">
        <img className="thumbnail" src={thumbnail}></img>
        <p>{name || url}</p>
        <div className="remove-button-wrapper">
          <button
            className="remove-button primary-button"
            onClick={
              isOwn
                ? skipSong
                : () => {
                    ToastsStore.info(
                      "Only the person that added the song can skip it ☝️"
                    );
                  }
            }
          >
            Skip
          </button>
        </div>
      </div>
      <UpvoteButton votes={votes} disabled hasVoted={hasVoted} />
    </div>
  );
};

export default Tracks;

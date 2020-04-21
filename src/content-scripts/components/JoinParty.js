import React, { useState } from "react";
import { JOIN_PARTY, PLAYLIST } from "../../gql";
import { useMutation, useQuery } from "@apollo/client";
import UsersSection from "./UsersSection";

const JoinParty = ({ onJoined }) => {
  const url = new URL(window.location.href);
  const playlistId = url.searchParams.get("playlistPartyId");

  const { data } = useQuery(PLAYLIST, {
    variables: { id: playlistId },
    skip: !playlistId,
  });

  const [name, setName] = useState();
  const [join] = useMutation(JOIN_PARTY, {
    variables: { name, id: playlistId },
    onCompleted: (data) => {
      chrome.runtime.sendMessage({
        type: "JOIN_PARTY",
        payload: data.joinParty,
      });
      onJoined(data.joinParty);
    },
  });

  return (
    <div id="side-bar-content">
      <h1>Join party</h1>
      <UsersSection
        style={{ marginTop: "20px" }}
        users={data?.playlist?.users}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          join();
        }}
      >
        <input
          value={name}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginBottom: "15px" }}
        />
        <button className="primary-button" type="submit">
          Join
        </button>
      </form>
    </div>
  );
};

export default JoinParty;

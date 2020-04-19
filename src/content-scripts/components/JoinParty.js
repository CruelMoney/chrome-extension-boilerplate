import React, { useState } from "react";
import { JOIN_PARTY } from "../../gql";
import { useMutation } from "@apollo/client";

const JoinParty = ({ onJoined }) => {
  const url = new URL(window.location.href);
  const playlistId = url.searchParams.get("playlistPartyId");

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
    <div>
      <h1>Join party</h1>
      <form onSubmit={() => join()}>
        <input
          value={name}
          placeholder="Your name"
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default JoinParty;

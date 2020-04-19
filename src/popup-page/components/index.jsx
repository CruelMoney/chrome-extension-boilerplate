import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation } from "@apollo/client";
import { START_PARTY, JOIN_PARTY } from "../../gql";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <InnerContent />
      </ConnectBackend>
    );
  }
}

const InnerContent = () => {
  const [party, setParty] = useState();

  useEffect(() => {
    chrome.storage.local.get(["party"], function (result) {
      setParty(result?.party);
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1>Create a YouTube Party</h1>
      <CreatePartyButton party={party} />
    </div>
  );
};

const CreatePartyButton = ({ party }) => {
  const [name, setName] = useState();
  const [mutate, { data }] = useMutation(START_PARTY);
  const [joinParty] = useMutation(JOIN_PARTY);

  const partyUrl = data?.startParty?.url || party?.playlist?.url;

  if (partyUrl) {
    return <input value={partyUrl}></input>;
  }

  const startParty = async () => {
    const { data } = await mutate();
    const playlist = data?.startParty;
    const { data: playlistdata } = await joinParty({
      variables: { id: playlist.id, name },
    });

    if (playlistdata) {
      chrome.runtime.sendMessage({
        type: "PARTY_STARTED",
        payload: playlistdata.joinParty,
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startParty();
      }}
    >
      <input
        placeholder="Your name"
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Start the party</button>
    </form>
  );
};

const styles = {
  container: {
    padding: "15px",
    height: "500px",
    width: "375px",
  },
};

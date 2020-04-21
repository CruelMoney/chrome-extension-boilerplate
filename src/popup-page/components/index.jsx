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
      <h2>Create a YouTube Party</h2>
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
    return (
      <label style={styles.label}>
        Invitation link
        <input style={styles.input} value={partyUrl}></input>
      </label>
    );
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
        style={styles.input}
        placeholder="Your name"
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" style={styles.button}>
        Start the party
      </button>
    </form>
  );
};

const styles = {
  container: {
    padding: "0 10px 10px 10px",
    width: "275px",
    fontFamily: "Roboto, Arial, sans-serif",
  },
  input: {
    fontSize: "15px",
    color: "rgb(18, 43, 72)",
    height: "40px",
    width: "100%",
    display: "block",
    fontWeight: "400",
    textIndent: "9px",
    background: "rgb(246, 248, 249)",
    borderRadius: "0.222em",
    borderWidth: "initial",
    borderStyle: "none",
    outline: "none",

    marginTop: "3px",
  },
  button: {
    fontWeight: 600,
    fontSize: "15px",
    color: "#fff",
    textAlign: "center",
    lineHeight: "20px",
    cursor: "pointer",
    minWidth: "150px",
    height: "40px",
    display: "block",
    maxWidth: "100%",
    width: "100%",
    position: "relative",
    background: "rgb(204, 0, 0)",
    borderRadius: "4px",
    borderStyle: "none",
    padding: "0px 1em",
    marginTop: "15px",
  },
  label: {
    color: "rgb(96, 96, 96)",
    fontSize: "15px",
  },
};

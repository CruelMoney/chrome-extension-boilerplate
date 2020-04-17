import React, { useEffect } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation } from "@apollo/client";
import { START_PARTY } from "../../gql";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <div style={styles.container}>
          <h1>Create a YouTube Party</h1>
          <CreatePartyButton />
        </div>
      </ConnectBackend>
    );
  }
}

const CreatePartyButton = () => {
  const [mutate, { data }] = useMutation(START_PARTY);

  const url = data?.startParty?.url;

  if (url) {
    return <input value={url}></input>;
  }

  const startParty = async () => {
    const { data } = await mutate();
    const id = data?.startParty?.id;
    if (id) {
      chrome.runtime.sendMessage(
        {
          type: "PARTY_STARTED",
          payload: id,
        },
        function (response) {
          console.log(response);
        }
      );
    }
  };

  return <button onClick={startParty}>Start the party</button>;
};

const styles = {
  container: {
    padding: "15px",
    height: "500px",
    width: "375px",
  },
};

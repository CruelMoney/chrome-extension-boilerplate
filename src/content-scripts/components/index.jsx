import React, { useEffect, useState } from "react";
import ConnectBackend from "../../ConnectBackend";

import JoinParty from "./JoinParty";
import SideBar from "./SideBar";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <div id="party-sidebar">
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

  console.log({ party });

  if (!party) {
    return <JoinParty onJoined={setParty} />;
  }

  return <SideBar party={party} />;
};

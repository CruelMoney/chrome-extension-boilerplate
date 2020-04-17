import React, { useEffect } from "react";
import ConnectBackend from "../../ConnectBackend";
import { useMutation } from "@apollo/client";
import { JOIN_PARTY } from "../../gql";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <div style={styles.sideBar}>
          Hi from content script
          <LeavePartyButton />
          <Tracks />
        </div>
      </ConnectBackend>
    );
  }
}

const LeavePartyButton = () => {
  const leaveParty = () => {
    chrome.runtime.sendMessage({
      type: "LEAVE_PARTY",
    });
    window.location.reload();
  };

  return <button onClick={leaveParty}>Leave party</button>;
};

const Tracks = () => {
  const [join, { data, error }] = useMutation(JOIN_PARTY);
  const { tracks = [], id, currentIndex } = data?.joinParty || {};

  useEffect(() => {
    chrome.storage.local.get(["party"], function (result) {
      join({ variables: { id: result.party } });
    });
  }, []);

  useEffect(() => {
    if (id) {
      const track = tracks[currentIndex];
      if (window.location.href !== track.url) {
        window.location.href = track.url;
      }
    }
  }, [currentIndex, id]);

  return (
    <div>
      <h2>Tracks</h2>
      <h3>{id}</h3>
      <ul>
        {tracks.map((t, idx) => (
          <li key={idx}>{t.url}</li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
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
};

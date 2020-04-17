import React from "react";
import ConnectBackend from "../../ConnectBackend";

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

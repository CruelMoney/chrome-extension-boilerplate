import React from "react";
import ConnectBackend from "../ConnectBackend";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <div style={styles.container}>
          <h1>Create a YouTube Party</h1>
          <ChangeColorButton />
        </div>
      </ConnectBackend>
    );
  }
}

const ChangeColorButton = () => {
  const change = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: 'document.body.style.backgroundColor = "red";',
      });
    });
  };

  return <button onClick={change}>Start the party</button>;
};

const styles = {
  container: {
    padding: "15px",
    height: "500px",
    width: "375px",
  },
};

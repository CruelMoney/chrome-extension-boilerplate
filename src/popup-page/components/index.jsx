import React from "react";
import styled from "styled-components";
import ConnectBackend from "../../ConnectBackend";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <ConnectBackend>
        <Popup>
          <h1>YouTube Party Playlist</h1>
          <ChangeColorButton />
        </Popup>
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

  return <button onClick={change}>Change color</button>;
};

const Popup = styled.div`
  width: 375px;
  height: 500px;
  overflow-y: scroll;
  padding: 15px;
`;

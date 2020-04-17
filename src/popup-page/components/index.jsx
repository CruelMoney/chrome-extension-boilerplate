import React from "react";

export default class Index extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <h1>YouTube Party Playlist</h1>
        <ChangeColorButton />
      </div>
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

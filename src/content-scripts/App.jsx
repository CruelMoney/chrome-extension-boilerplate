import React from "react";
import ReactDOM from "react-dom";
import Index from "./components";

document.querySelectorAll("ytd-video-renderer").forEach((node) => {
  const button = document.createElement("button");
  button.className = "add-party-playlist-button";
  const url = node.querySelector("a").getAttribute("href");
  button.setAttribute("data-url", "https://www.youtube.com" + url);
  button.innerText = "Add to Party Playlist";
  node.appendChild(button);
});

const Element = document.createElement("div");
Element.setAttribute("id", "dfghbnjmERHJKFGHNMVBNMFBNMbmvvxnbdgf");
document.body.appendChild(Element);

const style = document.createElement("style");
style.textContent = "ytd-app{ padding-right: 450px; }";
document.head.append(style);
ReactDOM.render(
  <Index />,
  document.getElementById("dfghbnjmERHJKFGHNMVBNMFBNMbmvvxnbdgf")
);

import React from "react";
import { useSubscription, useQuery } from "@apollo/client";
import { PLAYLIST_UPDATED, PLAYLIST } from "../../gql";
import UsersSection from "./UsersSection";
import useGuestActions from "./useGuestActions";
import useAdminActions from "./useAdminActions";
import {
  ToastsContainer,
  ToastsContainerPosition,
  ToastsStore,
} from "react-toasts";
import Tracks, { CurrentTrack } from "./Tracks";

const SideBar = ({ party }) => {
  let { data } = useQuery(PLAYLIST, {
    variables: { id: party.playlist.id },
  });

  const { data: subscriptionData } = useSubscription(PLAYLIST_UPDATED, {
    variables: { id: party.playlist.id },
  });

  const { user } = party;
  data = {
    ...data,
    ...subscriptionData,
  };
  const playlist = data?.playlist;
  const { tracks = [], id, url, currentIndex, users = [] } = playlist || {};

  const currentTrack = tracks[currentIndex];
  const upcomingTracks = tracks.slice(currentIndex + 1);

  const admin =
    currentTrack?.addedBy?.id &&
    user?.id &&
    currentTrack.addedBy.id === user.id;

  const { goToNextSong } = useAdminActions({ playlist, admin });
  useGuestActions({ playlist, admin, userId: user?.id });

  if (!playlist) {
    return null;
  }

  return (
    <div id={"side-bar-content"}>
      <div className="top-area section">
        <h1>YouTube Party</h1>
        <label>
          Invitation link
          <input value={url} />
        </label>
      </div>

      <UsersSection users={users} />

      {currentTrack && (
        <div className="section with-border ">
          <h2>Now playing:</h2>
          <CurrentTrack
            {...currentTrack}
            skipSong={goToNextSong}
            user={user}
          ></CurrentTrack>
        </div>
      )}

      {upcomingTracks?.length ? (
        <NextUpSection
          user={user}
          admin={admin}
          tracks={upcomingTracks}
          playlistId={id}
        />
      ) : (
        <EmptyPlaylist />
      )}
      <CreatedBySection />
      <ToastsContainer
        position={ToastsContainerPosition.BOTTOM_CENTER}
        store={ToastsStore}
      />
    </div>
  );
};

const NextUpSection = ({ ...props }) => {
  return (
    <div className="section with-border next-up-wrapper">
      <h2>Up next:</h2>
      <div className=" next-up">
        <Tracks {...props} />
        <div style={{ height: "40px" }}></div>
      </div>
    </div>
  );
};

const CreatedBySection = ({ ...props }) => {
  return (
    <div className="created-by">
      <a className="row" href="https://twitter.com/ChrisDengso">
        <p>By Christopher Dengsø</p>
      </a>
    </div>
  );
};

const EmptyPlaylist = () => {
  const imgUrl = chrome.runtime.getURL("images/howto.png");
  return (
    <div className="section empty-playlist">
      <p>
        No tracks added to the playlist. Click on any video to add it to the
        playlist.
      </p>
      <div className="relative">
        <img src={imgUrl} />
        <div className="tappable" />
      </div>
    </div>
  );
};

export default SideBar;

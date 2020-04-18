import { gql } from "@apollo/client";

export const START_PARTY = gql`
  mutation StartParty($url: String) {
    startParty(url: $url) {
      id
      url
    }
  }
`;

export const JOIN_PARTY = gql`
  mutation JoinParty($id: ID!) {
    joinParty(id: $id) {
      id
      url
      currentIndex
      currentSongStartedTimestamp
      currentSongPlaybackSecond
      tracks {
        url
        votes
      }
    }
  }
`;

export const UPDATE_PLAYLIST = gql`
  mutation UpdatePlaylist(
    $id: ID!
    $currentSongStartedTimestamp: BigInt!
    $currentSongPlaybackSecond: Int!
  ) {
    updatePlaylistState(
      id: $id
      currentSongStartedTimestamp: $currentSongStartedTimestamp
      currentSongPlaybackSecond: $currentSongPlaybackSecond
    ) {
      id
      url
      currentIndex
      currentSongStartedTimestamp
      currentSongPlaybackSecond
      tracks {
        url
        votes
      }
    }
  }
`;

export const PLAYLIST_UPDATED = gql`
  subscription PlaylistUpdated($id: ID!) {
    playlistUpdated(id: $id) {
      id
      url
      currentIndex
      currentSongStartedTimestamp
      currentSongPlaybackSecond
      tracks {
        url
        votes
      }
    }
  }
`;

export const ADD_TRACK = gql`
  mutation AddTrack($id: ID!, $url: String!) {
    addTrack(playlistId: $id, url: $url)
  }
`;

export const REMOVE_TRACK = gql`
  mutation RemoveTrack($id: ID!, $url: String!) {
    removeTrack(playlistId: $id, url: $url)
  }
`;

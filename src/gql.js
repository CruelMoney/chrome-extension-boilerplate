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
        name
      }
    }
  }
`;

export const UPDATE_PLAYLIST = gql`
  mutation UpdatePlaylist(
    $id: ID!
    $currentIndex: Int!
    $currentSongStartedTimestamp: BigInt!
    $currentSongPlaybackSecond: Int!
  ) {
    updatePlaylistState(
      id: $id
      currentSongStartedTimestamp: $currentSongStartedTimestamp
      currentSongPlaybackSecond: $currentSongPlaybackSecond
      currentIndex: $currentIndex
    ) {
      id
      url
      currentIndex
      currentSongStartedTimestamp
      currentSongPlaybackSecond
      tracks {
        url
        votes
        name
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
        name
      }
    }
  }
`;

export const ADD_TRACK = gql`
  mutation AddTrack($id: ID!, $url: String!, $name: String) {
    addTrack(playlistId: $id, url: $url, name: $name)
  }
`;

export const REMOVE_TRACK = gql`
  mutation RemoveTrack($id: ID!, $url: String!) {
    removeTrack(playlistId: $id, url: $url)
  }
`;

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
  mutation JoinParty($id: ID!, $name: String) {
    joinParty(id: $id, name: $name) {
      playlist {
        id
        url
        currentIndex
        currentSongStartedTimestamp
        currentSongPlaybackSecond
        tracks {
          id
          url
          votes {
            id
            user {
              id
            }
          }
          name
        }
        users {
          id
          name
        }
      }
      user {
        id
      }
    }
  }
`;

export const LEAVE_PARTY = gql`
  mutation LeaveParty($id: ID!, $user: ID!) {
    leaveParty(id: $id, user: $user)
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
        id
        url
        votes {
          id
          user {
            id
          }
        }
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
        id
        url
        votes {
          id
          user {
            id
          }
        }
        name
      }
      users {
        id
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
  mutation RemoveTrack($playlistId: ID!, $id: ID!) {
    removeTrack(playlistId: $playlistId, id: $id)
  }
`;

export const VOTE = gql`
  mutation Vote($trackId: ID!, $user: ID!) {
    castVote(trackId: $trackId, user: $user)
  }
`;

export const REMOVE_VOTE = gql`
  mutation RemoveVote($trackId: ID!, $user: ID!) {
    removeVote(trackId: $trackId, user: $user)
  }
`;

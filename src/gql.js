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
      currentSecond
      currentIndex
      tracks {
        url
        votes
      }
    }
  }
`;

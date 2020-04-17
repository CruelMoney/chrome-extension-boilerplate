import { gql } from "@apollo/client";

export const START_PARTY = gql`
  mutation StartParty($url: String) {
    startParty(url: $url) {
      id
      url
    }
  }
`;

import { gql } from "@apollo/client";

export const START_PARTY = gql`
  mutation StartParty {
    startParty {
      id
      url
    }
  }
`;

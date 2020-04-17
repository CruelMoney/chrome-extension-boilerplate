import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  setContext,
  split,
  ApolloLink,
} from "@apollo/client";

import { ApolloProvider } from "@apollo/react-hooks";
import { getMainDefinition } from "@apollo/client/utilities";

import { WebSocketLink } from "@apollo/link-ws";

const isDevelopment = true;

const cache = new InMemoryCache();

const domain = "http://localhost:8000";

const protocol = isDevelopment ? "ws://" : "wss://";
const subDomain = domain.split("://").pop();
const uri = protocol + subDomain + "/graphql";

const HttpLink = createHttpLink({ uri: domain });

const wsLink = new WebSocketLink({
  uri,
  options: {
    reconnect: true,
  },
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  HttpLink
);

const client = new ApolloClient({
  cache,
  link,
});

const ConnectBackend = ({ children }) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ConnectBackend;

export { client };

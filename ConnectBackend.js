import React from "react";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  setContext,
  split,
  ApolloLink,
} from "@apollo/client";

import { ApolloProvider } from "@apollo/react-hooks";
import { getMainDefinition } from "@apollo/client/utilities";

import { WebSocketLink } from "@apollo/link-ws";

const ConnectBackend = ({ children }) => {
  const cache = new InMemoryCache();

  const protocol = process.env.NODE_ENV === "development" ? "ws://" : "wss://";
  const domain = environment.GQL_DOMAIN.split("://").pop();
  const uri = protocol + domain + "/graphql";

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
    connectToDevTools: true,
    resolvers,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ConnectBackend;

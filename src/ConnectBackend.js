import React from "react";
import { ApolloClient, InMemoryCache, setContext } from "@apollo/client";

import { ApolloProvider } from "@apollo/react-hooks";
import { split, ApolloLink } from "apollo-link";
import { getMainDefinition } from "@apollo/client/utilities";

import { WebSocketLink } from "@apollo/link-ws";

const ConnectBackend = ({ children }) => {
  const withToken = setContext(async (_, { headers }) => {
    const userToken = authService.getToken();

    return {
      headers: {
        ...headers,
        "x-token": userToken ? `${userToken}` : "",
      },
    };
  });

  const cache = new InMemoryCache({ fragmentMatcher }).restore(
    window.__APOLLO_STATE__
  );

  const uploadLink = createUploadLink({
    uri: environment.GQL_DOMAIN,
    credentials: "include",
    fetch: customFetch,
  });

  const httpLink = ApolloLink.from([errorLink, withToken, uploadLink]);

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
    httpLink
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

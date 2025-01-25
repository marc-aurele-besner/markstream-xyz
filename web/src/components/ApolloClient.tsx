"use client";
// ^ this file needs the "use client" pragma

import { ApolloLink, HttpLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

// have a function to create a client for you
function makeClient() {
  const httpLink1 = new HttpLink({
    // this needs to be an absolute url, as relative urls cannot be used in SSR
    uri: "https://subql.blue.taurus.subspace.network/v1/graphql",
    // you can disable result caching here if you want to
    // (this does not work if you are rendering your page with `export const dynamic = "force-static"`)
    // fetchOptions: { cache: "no-store" },
  });

  const httpLink2 = new HttpLink({
    uri: "https://subgraph.satsuma-prod.com/09f017a8af66/marcaurele--322790/mark-stream/api",
  });

  // Use split to send data to each link based on a custom condition
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "query" &&
        (definition.name?.value.startsWith("Subgraph") || false)
      );
    },
    httpLink2,
    httpLink1
  );

  // use the `ApolloClient` from "@apollo/experimental-nextjs-app-support"
  return new ApolloClient({
    // use the `InMemoryCache` from "@apollo/experimental-nextjs-app-support"
    cache: new InMemoryCache(),
    link: ApolloLink.from([link]),
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

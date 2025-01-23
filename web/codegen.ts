import type { CodegenConfig } from "@graphql-codegen/cli";
// import * as dotenv from "dotenv";

// dotenv.config();

const config: CodegenConfig = {
  generates: {
    "./src/gql/indexer/graphql.tsx": {
      schema: "https://subql.green.taurus.subspace.network/v1/graphql",
      documents: ["./src/gql/indexer/queries/**.gql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
    },

    "./src/gql/subgraph/graphql.tsx": {
      schema:
        "https://subgraph.satsuma-prod.com/09f017a8af66/marcaurele--322790/mark-stream/api",
      documents: ["./src/gql/subgraph/queries/**.gql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
    },
  },
};

export default config;

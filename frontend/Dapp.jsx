import React from "react"

import { createClient } from "@connect2ic/core";
import { defaultProviders } from "@connect2ic/core/providers";
import { Connect2ICProvider } from "@connect2ic/react";
import "@connect2ic/core/style.css";

// used as provider for connecting local internet identity
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
import dfxJson from "../dfx.json"
import canisterids from '../.dfx/local/canister_ids.json'

import * as main from "../.dfx/local/canisters/main";

import AppRouter from "./components/AppRouter";

// makes it possible to convert BigInt from canister Time type
BigInt.prototype.toJSON = function() { return this.toString() }

const isDev = () => import.meta.env.DEV;

const Dapp = () => {
  return (
    <AppRouter />
  )
}

const getProviders = () => {
  const DFX_PORT = dfxJson.networks.local.bind.split(":")[1];

  return isDev ? 
    [ 
      new InternetIdentity({
        dev: true,
        whitelist: [],
        providerUrl: `http://${canisterids.internet_identity.local}.localhost:${DFX_PORT}`,
        host: window.location.origin,
        }) 
    ] 
    : defaultProviders;
}

const newClient = createClient({
  canisters:  { 
    main
  },
  providers: getProviders(),
  globalProviderConfig: {
    dev: isDev,
  },
})

export { isDev }
export default () => (
  <Connect2ICProvider client={newClient}>
    <Dapp />
  </Connect2ICProvider>
)
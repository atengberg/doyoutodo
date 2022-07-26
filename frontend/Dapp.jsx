import React, { useState } from "react"
import styled from 'styled-components'

import { Collapse } from 'react-collapse';

import { createClient } from "@connect2ic/core";
import { defaultProviders } from "@connect2ic/core/providers";
import { ConnectButton, ConnectDialog, Connect2ICProvider } from "@connect2ic/react";
import "@connect2ic/core/style.css";

import * as main_local from "../.dfx/local/canisters/main_local"

import HeaderBar from "./components/Header";
import { TagIndices } from "./components/Header";
import Footer from "./components/Footer";
import Splash from "./components/Splash";
import Home from "./components/Home";
import Explorer from "./components/Explorer";



import AddTodo from './components/todos/AddTodo';
import ReadOnlyTodosList from './components/todos/ReadOnlyTodosList';

BigInt.prototype.toJSON = function() { return this.toString() }

const Dapp = () => {

  const [ isConnected, setIsConnected ] = useState(false);
  const [ tabIndex, setTabIndex ] = useState(TagIndices.All);

  // todo factor out to make splash smoother, also remember if the user been here already
  const [ isExploring, setIsExploring ] = useState(false);

  const onConnectedChanged = (e) => {
    if (isConnected) {
      setTabIndex(() => TagIndices.All);
      setIsConnected(() => false);
    } else {
      setIsConnected(() => true);
      setTabIndex(() => TagIndices.Home);
    }
  }

  const [ todoCountDep, setTodoCountDep ] = useState(0);
  const onTodoCreated = () => {
    console.log("onTodoCreated");
    setTodoCountDep(todoCountDep + 1);
    setTabIndex(() => TagIndices.Home);
  }

  const onTodoUpdated = () => {
    setTodoCountDep(todoCountDep + 1);
  }

  return (
   <>
    <SContainer>

      <HeaderBar 
        tabIndex={tabIndex} 
        setTabIndex={setTabIndex} 
        isConnected={isConnected} 
        onConnectedChanged={onConnectedChanged}
        todoCountDep={todoCountDep} />
      <div>
        <Collapse isOpened={isConnected && tabIndex === TagIndices.Create}>
          <AddTodo onTodoCreated={onTodoCreated} />
        </Collapse>
        <FillingCollapse isOpened={isConnected && tabIndex === TagIndices.Home}>
          <Home todoCountDep={todoCountDep} onTodoUpdated={onTodoUpdated} />
        </FillingCollapse>
        <FillingCollapse isOpened={tabIndex === TagIndices.All}>
          { isConnected ? 
              <Explorer /> : 
            isExploring ?
              <Explorer /> :
              <Splash exploreClicked={setIsExploring} /> 
          }
        </FillingCollapse>
         
      </div>
      
      <Filler>
          <div className="flex-one"/>
        <Footer /> 
      </Filler>
 
    </SContainer>
   </>
  )
}
const Filler = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
`


const FillingCollapse = styled(Collapse)`
  flex: one;
`

const client = createClient({
  canisters: {
    main_local,
  },
  providers: defaultProviders,
  globalProviderConfig: {
    /*
     * Disables dev mode in production
     * Should be enabled when using local canisters
     */
    dev: true//import.meta.env.DEV, REMEMBER TO SET THIS BACK
  },
})

export default () => (
  <Connect2ICProvider client={client}>
    <Dapp />
  </Connect2ICProvider>
)

const SContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  box-shadow: 3px 3px 2px hsla(220, 10%, 5%, .2) inset;
  
`

import React, { useEffect, useState } from "react"
import styled from 'styled-components'

import { useCanister } from "@connect2ic/react";
import { getDeploymentCanisterName } from '../utils/constants';


import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default function HeaderBar({ tabIndex, setTabIndex, isConnected, onConnectedChanged, todoCountDep }) {

  const [ allTodoCount, setAllTodoCount ] = useState("");
  const [ canister ] = useCanister(getDeploymentCanisterName());

  useEffect(() =>{
    let isMounted = true;

    const call = async () => {
      const queryTodoCount = async () => {
        let result;
        let error;
        try {
          let response = await canister.getTotalCreatedTodoCount();
          console.log(JSON.stringify(response))
          if (typeof response.ok !== 'undefined') {
            result = response.ok; 
          } else {
            error = response.err;
          }
        } catch (e) {
            console.log("Non trivial error while trying to parse canister result");
          error = e.message;
        } finally {
          return { hadSuccess: typeof result !== 'undefined', result, error };
        }
      }
      const { hadSuccess, result } = await queryTodoCount();
      if (hadSuccess && isMounted) {
        setAllTodoCount(() => result);
      };
    }
    call();
    return () => isMounted = false;
  }, [todoCountDep]);


  const getCountDisplayLiteral = () => {
    if (allTodoCount === "") return;
    let val = parseInt(allTodoCount);
    if (!isNaN(val) || val === 0) {
      if (val == 1) {
        return "1 Todo Created";
      } else {
        return `${val} Total Todos Created`;
      }
    }
  }

  return (
    <STopBar>
      <STabBarWrapper>
        <TabBar 
          tabIndex={tabIndex} 
          setTabIndex={setTabIndex} 
          isConnected={isConnected} 
          onConnectedChanged={onConnectedChanged}
        />
        <TodoCountLabel>
          { getCountDisplayLiteral() }
        </TodoCountLabel>

      </STabBarWrapper>
      <div className="unit-square-rem"/>
      <button className="button-85" onClick={onConnectedChanged}>{isConnected ? "Disconnect" : "Connect"}</button> 
      <div className="unit-square-rem"/>
    </STopBar>
  )
}

const TodoCountLabel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`

const STabBarWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`

const TagIndices = {
    Create: 0,
    Home: 1,
    All: 2,
    Daily: 3,
    Tagged: 4,
    Invites: 5
}; Object.freeze(TagIndices);


// note not using tab panel since i am using react collapse
// however using TabPanel also forced a height I could not edit, future: use as a subheader for filter tags?
const TabBar = ({ tabIndex, setTabIndex, isConnected }) => {
  return (
    <>
      <Tabs 
        selectedIndex={tabIndex} 
        onSelect={(index) => setTabIndex(index)}
      >
        <STabList>
          <Tab disabled={!isConnected} >Create</Tab>
          <Tab disabled={!isConnected} >Home</Tab>
          <Tab >All</Tab>
          <Tab disabled={!isConnected} >Daily</Tab>
          <Tab disabled >Tagged</Tab>
          <Tab disabled >Invites</Tab>
        </STabList>

        <TabPanel />
        <TabPanel />
        <TabPanel />
        <TabPanel />
        <TabPanel />
        <TabPanel />
        
      </Tabs> 
    </>
  )
}

const STabList = styled(TabList)`
  padding: 1em;
  font-size: 1.2em;
`
const STopBar = styled.div`
  width: 100%;

  display: flex;
  overflow: hidden;
  align-items: center;

  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05), 0 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 5px;
  padding: .3rem .6rem;
  border: 1px dotted hsla(0, 10%, 10%, .25);

  &:hover {
      border: 1px dotted hsla(0, 20%, 20%, .3);
      box-shadow: 0 0 20px rgba(0, 0, 0, .1), 0 0px 40px rgba(0, 0, 0, .1);
  }
`





export { TagIndices }





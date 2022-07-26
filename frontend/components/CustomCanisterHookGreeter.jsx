import React, { useState } from 'react';
import { useCanister } from "@connect2ic/react";
import { getDeploymentCanisterName } from '../utils/constants';


import styled from 'styled-components'



const useCanisterGreeter = () => {

    const [ state, setState ] = useState("not set");
    const [ isProcessing, setIsProcessing ] = useState(false);

    const [ canister ] = useCanister(getDeploymentCanisterName());
  
    const callGreet = async () => {
        setIsProcessing(true);
    
        const call = () => {
          
          let errorProducing = {
            firstArg: ["one"],
            secondArg: BigInt(0),
            thirdArg: "three"
          }

          let okProducing = {
            firstArg: ["one"],
            secondArg: BigInt(2),
            thirdArg: "three"
          }

          let broke = {
            firstArg: "one",
            secondArg: BigInt(2),
            thirdArg: "three"
          }

          const parseOkErrResponse = async (argToPassToCanister) => {
            let result;
            let error;
            try {
              let response = await canister.orderTest(argToPassToCanister);
              if (typeof response.ok !== 'undefined') {
                result = response.ok; 
              } else {
                error = response.err;
              }
            } catch (e) {
              error = e.message;
            } finally {
              return { hadSucess: typeof response.ok !== 'undefined', result, error };
            }
          }
          let result = parseOkErrResponse(errorProducing);
          return result;
        }
    
        let result = await call();
        setIsProcessing(false);
    }

    return {
        state,
        isProcessing,
        call: callGreet
    }
}


const CustomCanisterHookGreeter = () => {

    const { state, isProcessing, call } = useCanisterGreeter();


    const [ data, setData ] = useState("");
    const [ isAwaiting, setIsAwaiting ] = useState(false);
  
    const [ canister ] = useCanister(getDeploymentCanisterName());
  
    const callGreet = async () => {
      setIsAwaiting(true);
  
      const call = async () => {
        return await canister.greet();
      }
  
      let result = await call();
      setData(result);
      setIsAwaiting(false);
    }

    const callHook = () => {
        call();
    }
  
    return (
        <SCols>
        <div className="square-unit-rem" />
      <SCanisterTestDiv>
        NOT HOOK
        <div> canister is { isAwaiting ? "processing" : "idle"}  </div>
        <button className="button-85" onClick={() => callGreet()}>Greet Canister</button>
        <div>Canister test says [ {data} ]</div>
      </SCanisterTestDiv>
      <div className="square-unit-rem" />
      <SCanisterTestDiv>
        HOOK
        <div> canister is { isProcessing ? "processing" : "idle"} </div>
        <button className="button-85" onClick={() => callHook()}>Greet Canister</button>
        <div>Canister test says [ {state} ]</div>
      </SCanisterTestDiv>

        </SCols>

    )
  }
  
  const SCanisterTestDiv = styled.div`
    margin: 1em 0em;
    width: 100%;  
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  `

  const SCols = styled.div`
    display: flex; flex-direction: column;
    justify-content: center;
    align-items: center;
  `
  
  export default CustomCanisterHookGreeter;
import React, { createContext, useContext } from "react";

import { AppContext } from './AppContainer'

import { useCanister } from "@connect2ic/react";
import useCanisterTodos from "../hooks/useCanisterTodos";

const TodoContext = createContext();

const TodoContextProvider = ({ children, isConnected, principal}) => {


    const [ canister ] = useCanister("main")
  
    return (
        <TodoContext.Provider value={useCanisterTodos(isConnected, principal, canister)}>
            { children }
        </TodoContext.Provider>
    )
}

export { TodoContext }
export default TodoContextProvider;
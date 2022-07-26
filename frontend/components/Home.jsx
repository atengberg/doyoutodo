import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

import useWindowSize from '../hooks/useWindowSize';


import CustomCanisterHookGreeter from "./CustomCanisterHookGreeter";
import ReadOnlyTodosList from './todos/ReadOnlyTodosList';
import useCanisterQueryTodos from '../hooks/useCanisterQueryTodos';


export default function Home({ todoCountDep, onTodoUpdated }) {
  
    const [ results, setResults ] = useState([]);

    const onResults = (results) => {
        results.reverse();
        setResults(() => results);
    }

    const { isProcessing, queryCanisterForTodos } = useCanisterQueryTodos(onResults);

    useEffect(() => {
        queryCanisterForTodos();
    }, [todoCountDep]);

    return (
        <Sframe >
            
            note to self: do not use disparate list views use the same mechanism as the tag filter
            <Stitle>Welcome</Stitle>

            Dashboard style information including user profile details section goes here

            <Stitle>Personal Todos</Stitle>
            { results?.length > 0 ? <ReadOnlyTodosList onTodoUpdated={onTodoUpdated} todos={results} isProcessing={isProcessing} /> : <>No todos created yet</> }
    
        </Sframe>
    )
}

/*
          <CustomCanisterHookGreeter />


*/

const Stitle = styled.div`
    padding: 2rem;
    font-size: 1.5em;
    font-weight: 600;
    text-shadow: 1px 2px 1px hsla(210, 90%, 89%, 1);
`

const Sframe = styled.div`
    width: 100%;
    flex: one;
    display: flex;
    flex-direction: column;
`
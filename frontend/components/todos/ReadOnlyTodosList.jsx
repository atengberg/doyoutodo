import React, { useState } from 'react';
import styled, { keyframes } from "styled-components"
import DenormalizedTodoDetailsCard from './ReadOnlyDenormalizedTodoDetailsCard';

const generateFillerTodoList = ( count = 10 ) => {
    if (typeof count !== "number" || count < 1) {
        count = (Math.random() * 10) + (Math.random() + 10) + 1;
    } 
    let ret = [];
    for (let i = 0; i < count; ++i) {
        const flip = Math.random() < .25;
        
        const tagCount = (Math.random() * 5) + 3;
        let t = [];
        for (let j = 0; j < tagCount; ++j) t[j] = `TagNumber${j}`;
        ret[i] = {
            todoId: `${(i + 1)}`,
            authorDisplayName: "monte carlo",
            dateCreatedEpoch: Date.now(),
            dateLastUpdatedEpoch: Date.now(),
            title: `Title of Todo #${i + 1}`,
            content: "There are no differences but differences of degrees between different degrees of difference and non-difference. Don't let that stop you!",
            scheduleStatus: flip ? "scheduled" : "unscheduled",
            nominalInterimStart: flip ? Date.now() : null,
            nominalInterimStop: flip ? Date.now() : null,
            realInterimStart: null,
            realInterimStop: null,
            tags: t
        }
    }
    return ret;
}

export default function ReadOnlyTodosList({ count = 10, todos = [], onTodoUpdated, isProcessing }) {
    return (
        <>
        <SUl isProcessing={isProcessing}>
            {todos.map((e, i) => <li key={i}><DenormalizedTodoDetailsCard onTodoUpdated={onTodoUpdated} {...e} /></li>)}
        </SUl>
        </>
    )
}

const BlurLoadingKF = keyframes`
    0% { filter: blur(0px) };
    50% { filter: blur(5spx) }; 
    100% { filter: blur(0px) }; 
`

const SUl = styled.ul`
    list-style-type: none;

    animation-name: ${props => props.isProcessing ? BlurLoadingKF : null};
    animation-duration: ${props => props.isProcessing ? "3s" : null};
    animation-iteration-count: ${props => props.isProcessing ? "infinite" : null};
`
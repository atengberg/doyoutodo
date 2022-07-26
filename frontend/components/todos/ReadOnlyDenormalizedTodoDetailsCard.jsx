import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { formatMoEpicTimeHHMM_MMDD, formatMoEpicTimeHHMM, formatMoEpicTimeMMDDYY } from '../../utils/format-date-utils'
import TagsList from './TagsList';

import useCanisterTodoUpdater from '../../hooks/useCanisterTodoUpdater';

const SHOW_DEBUG = true;


// not this is now misnamed, will be refactoring to make response and as dynamic

const example = {
    todoId: null,
    authorDisplayName: "some display name",
    dateCreatedEpoch: Date.now(),
    dateLastUpdatedEpoch: Date.now(),
    title: "Some title",
    content: "Some yada content",
    scheduleStatus: null,
    nominalInterimStart: Date.now(),
    nominalInterimStop: Date.now(),
    realInterimStart: null,
    realInterimStop: null,
};

export default function DenormalizedTodoDetailsCard({
    todoId,
    authorDisplayName,
    dateCreatedEpoch,
    dateLastUpdatedEpoch,
    title,
    content,
    scheduleStatus,
    nominalInterimStart,
    nominalInterimStop,
    realInterimStart,
    realInterimStop,
    tags = ["tag1", "tag2", "tag3"],
    onTodoUpdated
}) {

    console.log("TODO is " + scheduleStatus);

    const onUpdateComplete = () => {
        onTodoUpdated();
    }

    const { isProcessing, markTodoComplete, activateExistingTodo } = useCanisterTodoUpdater(todoId, onUpdateComplete);

    const getUpdateStatusButton = () => {
        switch (scheduleStatus) {
            case 'active':
                return <div className="button-85" onClick={() => markTodoComplete()}>Complete</div> ;
            case 'scheduled':
            case 'unscheduled':
                return <div className="button-85" onClick={() => activateExistingTodo()}>Activate</div>;
            default:
                null;
        }  
    }

 
    const dateCreated = dateCreatedEpoch ? formatMoEpicTimeMMDDYY(dateCreatedEpoch) : "created undefined";
    const dateUpdated = dateLastUpdatedEpoch ? formatMoEpicTimeHHMM_MMDD(dateLastUpdatedEpoch) : "last updated undefined";

    let nomInterval = "not set";
    let realInterval = "not set";

    const getNominalInterval = () => `${formatMoEpicTimeHHMM(nominalInterimStart)} - ${formatMoEpicTimeHHMM(nominalInterimStop)}`; 

    if (typeof scheduleStatus === 'string') {
        if (scheduleStatus === 'scheduled') {
            nomInterval = getNominalInterval(); 
        } else if (scheduleStatus === 'active') {
            if (typeof nominalInterimStart !== 'undefined' && typeof nominalInterimStop !== 'undefined') {
                nomInterval = getNominalInterval();
            }
            if (typeof realInterval !== 'undefined') {
                realInterval = `started at ${formatMoEpicTimeHHMM(realInterimStart)}`;
            } else {
                realInterval = "error retrieving start time";
            }
            
        } else if (scheduleStatus === 'completed') {
            if (typeof nominalInterimStart !== 'undefined' && typeof nominalInterimStop !== 'undefined') {
                nomInterval = getNominalInterval(); 
            }
            if (typeof scheduleStatus !== 'undefined' && typeof realInterimStop !== 'undefined') {
                realInterval = `${formatMoEpicTimeHHMM(realInterimStart)} - ${formatMoEpicTimeHHMM(realInterimStop)}`
            }
        }
    } 

  
    return (
        <>
        <SCard isProcessing={isProcessing} > 
            { SHOW_DEBUG ? 
                <div className="split-columns smaller-subheader-text"> 
                    <div className="flex-one"/>
                    <div>id: {`${todoId ? todoId : "undefined"}`}</div>
                </div> : <></> }
            <div className="split-columns smaller-subheader-text"> 
                <SStatusWrapper>
                    <span className="status">{`${scheduleStatus}`}</span>
                    { getUpdateStatusButton() }
                </SStatusWrapper>
                <div className="flex-one"/>
                <div>created: {dateCreated}</div>
            </div>
            <div className="split-columns smaller-subheader-text"> 
                <div>planned: {nomInterval}</div>
                <div className="flex-one"/>
                <div>last updated: {dateUpdated}</div>
            </div>
            <div className="split-columns smaller-subheader-text"> 
                <div>actual: {realInterval}</div>
                <div className="flex-one"/>
                <div className="author">{`${authorDisplayName ? authorDisplayName : "author display name undefined"}`}</div>
            </div>
            <div className="top-margin"><span className="title">{`${title ? title : "undefined"}`}</span></div>
            <div><span className="content">{`${content ? content : "undefined"}`}</span></div>
            <div className="split-columns"> 
                <div className="flex-one"/>
                { tags.length > 0 ? <TagsList tags={tags} /> : `no tags`}
            </div>
            
        </SCard>
        </>
    )
};

const SStatusWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 2em;
`

const BlurLoadingKF = keyframes`
    0% { fitler: blur(0px) };
    50% { fitler: blur(4px) }; 
    100% { fitler: blur(0px) }; 
`

const SCard = styled.div`
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05), 0 0px 40px rgba(0, 0, 0, 0.08);
    border-radius: 5px;
    padding: 1rem;
    margin: 1rem;
    border: 1px dotted hsla(0, 10%, 10%, .25);

    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: .5rem;


    animation-name: ${props => props.isProcessing ? BlurLoadingKF : null};
    animation-duration: ${props => props.isProcessing ? "3s" : null};
    animation-iteration-count: ${props => props.isProcessing ? "infinite" : null};


    &:hover {
        border: 1px dotted hsla(0, 20%, 20%, .3);
        box-shadow: 0 0 20px rgba(0, 0, 0, .1), 0 0px 40px rgba(0, 0, 0, .1);
    }

    .split-columns {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-evenly;
        align-items: center;
    }

    .top-margin {
        margin-top: .25em;
    }

    .title {
        font-size: 2em;
        color: black;
    };

    .content {
        font-size: 1.5em;
    };

    .smaller-subheader-text {
        font-size: .75em;
    }

    .status {
        color: crimson;
    }

    .author {
        font-style: italic;
    }
`
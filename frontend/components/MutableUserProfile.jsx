import React, { useState } from "react";

import styled from "styled-components";

import { MdOutlineEditOff } from 'react-icons/md';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { MdDoneOutline } from 'react-icons/md';

const MutableUserProfile = ({
    onUpdateUserProfile,
    dateCreated = new Date(),
    lastUpdated = new Date(),
    principal,
    preferredName,
    emailAddress,
    todoCount,
        }) => {

    const [ isEditing, setIsEditing ] = useState(false);
    const [ editEmail, setEditEmail ] = useState(emailAddress);
    const [ editName, setEditName ] = useState(preferredName);

    const resetMutableFields = () => {
        setEditEmail(emailAddress);
        setEditName(preferredName);
    }

    const onEditingStarted = () => {
        resetMutableFields();
        setIsEditing(true);
    }

    const onEditingCancelled = () => {
        resetMutableFields();
        setIsEditing(false);
    }

    const onEditingConfirmed = () => {
        // call to canister optionally takes field values
        // so only add fields that have changed
        let newValues = {};
        if (preferredName !== editName) {
            newValues.newName = editName;
        }
        if (emailAddress !== editEmail) {
            newValues.newEmail = editEmail;
        }
        onUpdateUserProfile({ ...newValues });
    }

    return (
        <SContainer>
            <div className="flex-row">
                <div className="flex-one"/>
                { isEditing ? 
                <>
                    <MdDoneOutline 
                        onClick={() => onEditingConfirmed()}
                        size={20}    
                    />
                    <MdOutlineEditOff 
                        onClick={() => onEditingCancelled()}
                        size={20}
                    />
                </>
                :
                <MdOutlineModeEditOutline 
                    onClick={() => onEditingStarted()}
                    size={20} />
                }
            </div>
            <fieldset className="flex-row">
                <legend>associated principal</legend>
                { principal }
            </fieldset>
            <div className="spacer" />
            <fieldset className="flex-row">
                <legend>preferred display name</legend>
                { isEditing ?
                    <input 
                        type="text"
                        placeholder={"Enter preferred name..."}
                        value={editName}
                        onChange={(e) => setEditName(e.currentTarget.value)}
                    />
                    :
                    preferredName 
                 }
            </fieldset>
            <div className="spacer" />
            <fieldset className="flex-row">
                <legend>email address</legend>
                { isEditing ?
                    <input 
                        type="email"
                        placeholder={"Enter email address..."}
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.currentTarget.value)}
                    />
                    :
                    emailAddress 
                 }
            </fieldset>
            <div className="spacer" />
            <fieldset className="flex-row">
                <legend>total number of todos created</legend>
                { todoCount }
            </fieldset>
            <div className="flex-row center-align-items">
                <span className="time">{`created ${dateCreated.toLocaleString()}`}</span>
                <div className="flex-one"/>
                <span className="time">{`last edited ${lastUpdated.toLocaleString()}`}</span>
            </div>
        </SContainer>
    )
}

const SContainer = styled.div`
    width: 80%;
    display: flex;
    flex-direction: column;
    margin: 2rem auto;

    .spacer {
        padding: .25rem
    }

    .time {
        margin-top: 1rem;
        font-style: italic;
    }
`

export default MutableUserProfile;
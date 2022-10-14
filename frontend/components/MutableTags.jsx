import React, { useState } from 'react';
import styled from 'styled-components';

import { TagsInput } from "react-tag-input-component";

import { MdOutlineEditOff } from 'react-icons/md';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { MdDoneOutline } from 'react-icons/md';

const MutableTags = ({ 
    disable,
    displayValues = [],
    onEditStart,
    onTodoEdited
        }) => {
    const [ values, setValues ] = useState(displayValues);
    const [ isEditing, setIsEditing ] = useState(false);

    const onEditingStarted = () => {
        if (disable) return;
        setIsEditing(true);
        onEditStart("tags");
    }

    const onEditingCanceled = () => {
        setValues(displayValues);
        setIsEditing(false);
        onTodoEdited(false);
    }

    const onEditingConfirmed = () => {
        const equal = () => {
            if (values.length === displayValues.length) {
                for (let i = 0; i < values.length; ++i) {
                    if (values[i] !== displayValues[i]) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        }
        if (equal()) {
            // user didn't actually change input, don't force update call
            onEditingCanceled();
        } else {
            onTodoEdited(true, "tags", values);
            setIsEditing(false);
        }
    }

    return (
        <>
        <div className="flex-row">
            { isEditing ?
            <>
                <TagsInput 
                    value={values}
                    placeHolder="Updated keywords..."
                    onChange={(updatedTags) => setValues([...updatedTags])} 
                />
                <MdDoneOutline 
                    onClick={() => onEditingConfirmed()}
                    size={20}    
                />
                <MdOutlineEditOff 
                    onClick={() => onEditingCanceled()}
                    size={20}
                />
            </>
            :
            <>
                <div className="flex-row flex-wrap">{
                    displayValues.map((t, i) => <STag key={i}>#{t}</STag>) }
                </div>  
                { displayValues.length === 0 ? <STag onClick={() => onEditingStarted()}>Add Tag</STag> : null }
                <MdOutlineModeEditOutline 
                    onClick={() => onEditingStarted()}
                    size={20}
                />
            </>
            }
        </div>
    </>
    );
}

const STag = styled.span`
    padding: .25rem .5rem;
    margin-right: .3rem;
    border: 1px solid black;
`

export default MutableTags;
import React, { useState, useRef, useEffect } from 'react';
import { MdOutlineEditOff } from 'react-icons/md';
import { MdOutlineModeEditOutline } from 'react-icons/md';
import { MdDoneOutline } from 'react-icons/md';

const MutableText = ({ 
    disable,
    displayValue,
    placeHolder,
    field,
    onEditStart,
    onTodoEdited
        }) => {

    const inputRef = useRef(null);
    const [ value, setValue ] = useState(displayValue);
    const [ isEditing, setIsEditing ] = useState(false);

    const onEditingStarted = () => {
        if (disable) return;
        setIsEditing(true);
        onEditStart(field);
    }

    const onEditingCanceled = () => {
        setValue(displayValue);
        setIsEditing(false);
        onTodoEdited(false);
    }

    const onEditingConfirmed = () => {
        if (value === displayValue) {
            // user didn't actually change input, don't force update call
            onEditingCanceled();
        } else {
            onTodoEdited(true, field, value);
            setIsEditing(false);
        }
    }

    useEffect(() => {
        // if the user clicks start editing, want to focus the input element
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <>
            <div className="flex-row">
                { isEditing ?
                <>
                    <input 
                        ref={inputRef}
                        type="text"
                        placeholder={placeHolder}
                        value={value}
                        onChange={(e) => setValue(e.currentTarget.value)}
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
                    { displayValue === "" ? 
                        <span>{`Add ${field}`}</span>
                        :
                        <span>{displayValue}</span>
                    }
                    <MdOutlineModeEditOutline 
                        onClick={() => onEditingStarted()}
                        size={20}
                    />
                </>
                }
            </div>
        </>

    )
}

export default MutableText;
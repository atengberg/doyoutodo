import React, { useState, memo } from 'react';
import styled from 'styled-components';

import MutableStatus from './MutableStatus';
import MutableTags from './MutableTags';
import MutableText from './MutableText';

import { MdDeleteOutline } from 'react-icons/md';

const TodoCard = ({ 
    id,
    dateCreated,
    lastUpdated,
    status,
    scheduledInterval,
    title,
    description,
    tags,
    realStartTime,
    realStopTime,
    updateTodoStatus,
    editTodo,
    deleteTodo
         }) => {

    const [ editingState, setEditingState ] = useState({
        isEditing: false,
        editingWhich: ""
    });

    const onEditingStarted = (field) => {
        setEditingState({ isEditing: true, editingWhich: field });
    }

    const onEditingStopped = () => {
        setEditingState({ isEditing: false, editingWhich: "" });
    }

    const onTodoEdited = (confirmed, field, newValue) => {
        onEditingStopped();
        if (confirmed) {
            editTodo(id, field, newValue);
        } 
    }

    const onStatusChanged = (newStatus, newScheduledInterval) => {
        onEditingStopped();
        updateTodoStatus(id, newStatus, newScheduledInterval, status);
    }

    const getIfDisabled = (whichField) => {
        const { isEditing, field } = editingState;
        return (isEditing && field !== whichField);
    }

    return (
        <SCard>
            <MutableStatus 
                disable={getIfDisabled("status")}
                status={status} 
                scheduledInterval={scheduledInterval}
                onStatusChanged={onStatusChanged} 
                realStartTime={realStartTime}
                realStopTime={realStopTime}
                onEditStart={onEditingStarted}
                onEditingStopped={onEditingStopped}
            />
            <div className="flex-column">
                <MutableText
                    disable={getIfDisabled("title")}
                    displayValue={title}
                    placeHolder={"Update title..."}
                    field={"title"}
                    onEditStart={onEditingStarted}
                    onTodoEdited={onTodoEdited}
                />
                <div className="spacer" />
                <MutableText
                    disable={getIfDisabled("description")}
                    displayValue={description}
                    placeHolder={"Updated description..."}
                    field={"description"}
                    onEditStart={onEditingStarted}
                    onTodoEdited={onTodoEdited}
                />
                 <div className="spacer" />
                <MutableTags 
                    disable={getIfDisabled("tags")}
                    displayValues={tags}
                    placeHolder={"Updated keywords..."}
                    onEditStart={onEditingStarted}
                    onTodoEdited={onTodoEdited}
                />
            </div>
            <div className="flex-row center-align-items">
                <span className="time">{`created ${dateCreated.toLocaleString()}`}</span>
                <div className="flex-one"/>
                <span className="time">{`last edited ${lastUpdated.toLocaleString()}`}</span>
                <MdDeleteOutline onClick={() => deleteTodo(id)} size={20}/> 
            </div>
        </SCard>
    )
}

const SCard = styled.div`
    border: solid black 1px;
    padding: 1rem;
    margin-top: 2rem;

    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05), 0 0px 40px rgba(0, 0, 0, 0.08);
    border-radius: 5px;
    padding: 1rem;
    margin: 1rem;
    border: 1px dotted hsla(0, 10%, 10%, .25);

    .spacer {
        padding: .25rem
    }

    .time {
        margin-top: 1rem;
        font-style: italic;
    }
`

export default memo(TodoCard);

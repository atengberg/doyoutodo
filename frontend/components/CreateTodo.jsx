import React, { useReducer, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// next doesn't allow dynamic imports of styles from modules, here's workaround for DateTimeRangePicker
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker/dist/entry.nostyle'
import Dropdown from 'react-dropdown';
import { TagsInput } from "react-tag-input-component";
import ConfirmError from './ConfirmError';

import { TodoContext } from "./TodoContextProvider";

// for the time input for scheduled todo status type, convience method to get default values relative to now
const getDefaultScheduledInterval = () => {
    const now = new Date();
    const anHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    return [ now, anHourFromNow ];
}

const inputReducer = ( state, { type, key, payload }) => {
    let updateState = { ...state };
    switch (type) {
        case 'inputField':
            updateState[key] = payload;
            // if user changes status type, clear the default interval or reset it if 
            // the user changes it to scheduled status type
            if (key === 'statusType') {
                if (payload === 'Scheduled') {
                    const [ now, anHourFromNow ] = getDefaultScheduledInterval();
                    updateState.minDate = now;
                    updateState.scheduledInterval = [now, anHourFromNow];
                } else {
                    updateState.scheduledInterval = [];
                }
            } 
            return updateState;
        default: 
            return updateState;
    }
}

const CreateTodo = () => {
    const [ state, dispatch ] = useReducer(inputReducer, {
        statusType: 'Unscheduled',
        title: '',
        description: '',
        tags: [],
        scheduledInterval: [],
        minDate: new Date(),
    });

    const { 
        statusType, 
        title, 
        description, 
        tags, 
        scheduledInterval,
        minDate,
    } = state;

    const {
        isUpdating,
        hasCreateError,
        clearError,
        createTodo
    } = useContext(TodoContext);

    const navigate = useNavigate();

    const onSubmit = async () => { 
        await createTodo({
            statusType, 
            title,
            description,
            tags,
            scheduledInterval
        }, () => navigate("/home"));
    }

    const disable = () => (isUpdating || hasCreateError) ? true : false;

    return (
        <>
            <h1>Create Todo</h1>
            <div className="one-rem-padding" />
            <div>
                <input 
                    className="full-width one-third-rem-left-padding"
                    type="text"
                    placeholder=" Title..."
                    value={title}
                    disabled={disable()}
                    onChange={(e) =>
                        dispatch({
                            type: 'inputField', 
                            key: "title", 
                            payload: e.currentTarget.value
                    })} 
                />
            </div>
            <div className="one-rem-padding" />
            <div>
                <input 
                    className="full-width one-third-rem-left-padding"
                    type="text"
                    placeholder=" Description..."
                    value={description}
                    disabled={disable()}
                    onChange={(e) =>
                        dispatch({
                            type: 'inputField', 
                            key: "description", 
                            payload: e.currentTarget.value
                    })} 
                />
            </div>
            <div className="one-rem-padding" />
            <TagsInput 
                value={tags}
                placeHolder="Keywords... (<enter> to add more)"
                disabled={disable()}
                onChange={(updatedTags) => 
                    dispatch({
                        type: 'inputField',
                        key: 'tags',
                        payload: updatedTags 
                })} 
            />
            <div className="one-rem-padding" />
            <Dropdown 
                options={[
                    'Unscheduled',
                    'Scheduled',
                    'Active',
                ]} 
                value={'Unscheduled'} 
                placeholder="Select Todo Type" 
                disabled={disable()}
                onChange={({ value }) => 
                    dispatch({
                        type: 'inputField',
                        key: 'statusType',
                        payload: value
             })} />
            { statusType === 'Scheduled' ?
                <DateTimeRangePicker 
                    value={scheduledInterval}
                    minDate={minDate}
                    disabled={disable()}
                    onChange={(interval) => 
                        dispatch({
                            type: 'inputField',
                            key: 'scheduledInterval',
                            payload: interval ? interval : getDefaultScheduledInterval()
                    })} 
                /> : null }
            <div className="one-rem-padding" />
            <div className="flex-row">
                <div className="flex-one"/>
                <button className="button-85"
                    disabled={disable()}
                    onClick={() => onSubmit()}
                > Create
                </button>
            </div>
            { hasCreateError ? 
                <ConfirmError errorMessage={hasCreateError} onConfirmed={() => clearError()} />
                : null 
            }
        </>
    )
}


export default CreateTodo;
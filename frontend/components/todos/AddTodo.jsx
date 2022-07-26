import React, { useState, useReducer } from 'react';
import styled from 'styled-components';
import ControlledTextInputWithClearIcon from '../ControlledTextInputWithClearIcon';
import AddNewTagTagsList from '../tags/AddNewTagWithTagsList';
import useCanisterTodoCreator from '../../hooks/useCanisterTodoCreator';

const reducer = (state, {type, key, payload }) => {
    switch (type) {
        case 'inputField':
            return { ...state, [key]: payload };
        default: state;
    }
}

const initReducerState = {
    addTodoType: 'unscheduled',
    titleIn: "",
    contentIn: "",
    tagsIn: [],
    scheduledIntervalIn: null,
    isSubmitting: false
}
// ({ placeHolder = "input some text", value = "", label, onTextInputChanged, inputRef })
export default function AddTodo({ onTodoCreated }) {
    const [ state, dispatch ] = useReducer(reducer, initReducerState);
    const { addTodoType, titleIn, contentIn, tagsIn, scheduledIntervalIn } = state;

    const { isProcessing, hadSuccess, errorMessage, callCanisterCreateTodo } = useCanisterTodoCreator(onTodoCreated);

    const onScheduleSelected = (selected) => {
        dispatch({ type: "inputField", key: "addTodoType", payload: selected });
    }

    const onTextInputChanged = (label, textValue, wasCleared) => {
        dispatch({ type: "inputField", key: label, payload: textValue });
    }

    const onTagsChanged = (tags) => {
        dispatch({ type: "inputField", key: "tagsIn", payload: tags });
    }

    const onScheduledIntervalChanged = (start, stop) => {
        console.log("start " + start);
        console.log("stop " + stop)
        dispatch({ type: "inputField", key: "scheduledIntervalIn", payload: { startTime: start.getTime(), stopTime: stop.getTime() } });
    }

    const doAddTodo = () => {
        const objectToPass = {
            addTodoType,
            titleIn,
            contentIn,
            tagsIn,
            scheduledIntervalIn
        }
        callCanisterCreateTodo(objectToPass);
    }

    return (
        <SAddTodoContainer>
            <div className='title'>
                Create and Add New Todo
            </div>  <div className="unit-square-rem" />
            <div className="section">
                <span className="subtitle">Title</span> <div className="spacer"/>
                <ControlledTextInputWithClearIcon 
                    placeHolder={"Add Todo Title..."} onTextInputChanged={onTextInputChanged}
                    value={titleIn} label={"titleIn"} /> {/* can add input ref */}
            </div>  <div className="unit-square-rem" />
            <div className="section">
            <span className="subtitle">Details</span>  <div className="spacer"/>
                <ControlledTextInputWithClearIcon 
                    placeHolder={"Add Details or Content..."} onTextInputChanged={onTextInputChanged}
                    value={contentIn} label={"contentIn"} /> {/* can add input ref */}
            </div>  <div className="unit-square-rem" />
            <div className="section">
                <AddNewTagTagsList tags={tagsIn} onTagsChanged={onTagsChanged} />
            </div> 
            <div className="section">   
                <ConfigureSchedule 
                        onScheduledIntervalChanged={onScheduledIntervalChanged}
                        onScheduleSelected={onScheduleSelected} 
                        selectedSchedule={addTodoType} />
            </div>
            <div className="last-row section">
                <div className="flex-one"/>
                <button className="button-85" onClick={doAddTodo}>{addTodoType === 'active' ? "Add && Start Now!" : "Add New Todo"}</button>
                <div className="unit-square-rem"/>
            </div>
            <div className="unit-square-rem" />
            <div className="last-row section">
                <div className="flex-one"/>
                <div>processing:</div> { JSON.stringify(isProcessing) }
                <div className="unit-square-rem"/>
            </div>
        </SAddTodoContainer>
    )
}

const SAddTodoContainer = styled.div`

    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05), 0 0px 40px rgba(0, 0, 0, 0.08);
    border-radius: 5px;
    padding: 1rem;
    margin: 1rem;
    border: 1px dotted hsla(0, 10%, 10%, .25);

    display: flex;
    flex-direction: column;
    justify-content: center;

    &:hover {
        border: 1px dotted hsla(0, 20%, 20%, .3);
        box-shadow: 0 0 20px rgba(0, 0, 0, .1), 0 0px 40px rgba(0, 0, 0, .1);
    }

    .last-row {
        width: 100%;
        display: flex;
    }

    .title {
        font-size: 2em;
        font-weight: bold;
        user-select: none;
        -webkit-user-select: none;
    }

    .subtitle {
        font-size: 1.5em;
        font-weight: 500;
        font-style: italic;
        user-select: none;
        -webkit-user-select: none;
    }

    .spacer {
        height: .5rem;
    }

    .section {
        padding-top: .1rem;
        width: 100%;
    }
`

const ConfigureSchedule = ({ selectedSchedule, onScheduleSelected, onScheduledIntervalChanged }) => {

    return (
        <SConfigureSchedule>
            <div className="flex-one"/>
            <ScheduleSelect selectedSchedule={selectedSchedule} onScheduleSelected={onScheduleSelected} />
            <div className="columns">
                <div />
                <SScheduleTimeInputsContainer show={selectedSchedule === "scheduled"}>
                    <ScheduledTimeInputs onScheduledIntervalChanged={onScheduledIntervalChanged} />
                </SScheduleTimeInputsContainer>
                <div />
            </div>
            <div className="flex-one"/>
        </SConfigureSchedule>
    )
}


const SConfigureSchedule = styled.div`
    display: inline-flex;
    flex-direction: column; 
    width: 100%;
    align-items: center;
    
    .columns {
        width: 40em;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`

const SScheduleTimeInputsContainer = styled.div`
    padding: 0 1rem;
    visibility: ${props => props.show ? "visible" : "hidden"};
`

const ScheduleSelect = ({ selectedSchedule = "unscheduled", onScheduleSelected }) => {
    if (typeof onScheduleSelected === 'undefined') throw new Error("Using schedule selector without callback for selection!");
    return (
        <SScheduleSelectWrapper >
            <SScheduleSelect>
                <SScheduleSelectElement 
                    onClick={() => onScheduleSelected("unscheduled")}
                    isSelected={selectedSchedule === "unscheduled"}
                >not scheduled</SScheduleSelectElement>
                <div className="line-seperator" />
                <div className="line-seperator" />
                <div className="line-seperator" />
                <SScheduleSelectElement 
                    onClick={() => onScheduleSelected("scheduled")}
                    isSelected={selectedSchedule === "scheduled"}
                >schedule at</SScheduleSelectElement>
                <div className="line-seperator" />
                <div className="line-seperator" />
                <div className="line-seperator" />
                <SScheduleSelectElement 
                    onClick={() => onScheduleSelected("active")}
                    isSelected={selectedSchedule === "active"}
                >start currently</SScheduleSelectElement>
            </SScheduleSelect>
        </SScheduleSelectWrapper>
    )
}

const SScheduleSelectWrapper = styled.div`
   width: 60%;
`

const SScheduleSelect = styled.div`
    display: flex; flex-direction: row; align-items: center; justify-content: space-evenly;
    border: 1px solid black;
    border-radius: 3px;
    border-color: black;
    width: 100%;
    height: 3em;

    .line-seperator { height: 100%;  width: 1px;  background-color: black; }
`

const SScheduleSelectElement = styled.div`
    text-align: center;
    padding: .75rem 1em;
    width: 100%;
    height: 100%;
    background-color: ${props => props.isSelected ? "black" : "white" };
    color: ${props => props.isSelected ? "white" : "black" };
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;

    &:hover {
        text-decoration: ${props => props.isSelected ? "" : "underline dotted"}
    }
`

// lack of XOR origin from asset canister means a lot of components libraries i can't figure out if they can be used?
// as a real here is this contrived drop down
const ScheduledTimeInputs = ({ onScheduledIntervalChanged }) => {    
    if (typeof onScheduledIntervalChanged === 'undefined') throw new Error("Using scheduled time input without callback for selection!");

    const getTodayDateInputFormatted = () => {
        let d = new Date();
        let month = `${parseInt(d.getMonth()) + 1}`;
        if (month.length === 1) month = "0" + month;
        let dayMonth = `${parseInt(d.getDate())}`;
        if (dayMonth.length === 1) dayMonth = "0" + dayMonth;
        let fullYear = d.getFullYear();
        return fullYear + "-" + month + "-" + dayMonth;
    }

    const [ dateInputLiteral, setDateInputLiteral ] = useState(getTodayDateInputFormatted());
    const [ startHour, setStartHour ] = useState(0);
    const [ startMinute, setStartMinute ] = useState(0);
    const [ stopHour, setStopHour ] = useState(0);
    const [ stopMinute, setStopMinute ] = useState(1);

    const calculateNewInterval = ({ startHour, startMinute, stopHour, stopMinute }) => {
        let [ year, month, day ] = dateInputLiteral.split("-");
        let startTime = new Date();
        startTime.setFullYear(parseInt(year));
        startTime.setMonth(parseInt(month) - 1);
        startTime.setDate(parseInt(day));
        startTime.setHours(parseInt(startHour));
        startTime.setMinutes(parseInt(startMinute));
        startTime.setSeconds(0);
        let stopTime = new Date();
        stopTime.setFullYear(parseInt(year));
        stopTime.setMonth(parseInt(month) - 1);
        stopTime.setDate(parseInt(day));
        stopTime.setHours(parseInt(stopHour));
        stopTime.setMinutes(parseInt(stopMinute));
        stopTime.setSeconds(0);
        onScheduledIntervalChanged(startTime, stopTime);
    }

    const onStartHourChanged = (newValue) => {
        setStartHour(newValue);
        if (parseInt(newValue) >= parseInt(stopHour)) {
            setStartMinute(0);
            setStopHour(newValue);
            setStopMinute(1);
        }
        calculateNewInterval({ startHour: newValue, startMinute: 0, stopHour: newValue, stopMinute: 1 });
    }

    const onStartMinuteChanged = (newValue) => {
        setStartMinute(newValue);
        calculateNewInterval({ startHour, startMinute: newValue, stopHour, stopMinute });
    }
    
    const onStopHourChanged = (newValue) => {         
        if (parseInt(newValue) >= parseInt(startHour)) {
            setStopHour(() => newValue); 
            calculateNewInterval({ startHour, startMinute, stopHour: newValue, stopMinute });
        }
    }

    const onStopMinuteChanged = (newValue) => {        
        if (parseInt(startHour) === parseInt(stopHour)) {
            if (parseInt(newValue) >= parseInt(startMinute)) {
                setStopMinute(newValue);
                calculateNewInterval({ startHour, startMinute, stopHour, stopMinute: newValue });
            }
        } else {
            setStopMinute(newValue);
            calculateNewInterval({ startHour, startMinute, stopHour, stopMinute: newValue });
        }
    }

    const onDateChange = (e) => setDateInputLiteral(e.currentTarget.value);

    return (
        <STimeInputContainer>
            <input type="date" value={dateInputLiteral} onChange={onDateChange}/>
            <SelectHourMinute 
                label={"start"}
                hourValue={startHour} onHourValueChanged={onStartHourChanged}
                minuteValue={startMinute} onMinuteValueChanged={onStartMinuteChanged}
            />
            <SelectHourMinute 
                label={"stop"}
                hourValue={stopHour} onHourValueChanged={onStopHourChanged}
                minuteValue={stopMinute} onMinuteValueChanged={onStopMinuteChanged}
            />
        </STimeInputContainer>
    )
}

const STimeInputContainer = styled.div`
    display: flex; flex-direction: column; align-items: center; justify-content: space-evenly;
    height: 100%;
`

const SelectHourMinute = ({ label = "start", hourValue, onHourValueChanged, minuteValue, onMinuteValueChanged }) => {
    if (typeof label === 'undefined') throw new Error("SelectHourMinute needs type");
    return (
        <SSelectHourMinute>
            <span className="label">{label}</span>
            <SelectTime value={hourValue} onValueChange={onHourValueChanged} /> 
            <span className="label">:</span> 
            <SelectTime value={minuteValue} type={"min"} onValueChange={onMinuteValueChanged} />
        </SSelectHourMinute>
    )
}

const SSelectHourMinute = styled.div`
    display: flex;
    flex-direction: row;
    .label {
        padding: 0 .5rem;
    }
`

const SelectTime = ({ type = "hour", value = "0", onValueChange }) => {
    let vals = type === "hour" ? Array.from(Array(24).keys()) : Array.from(Array(60).keys())
    return (
        <select value={value} onChange={(e) => onValueChange(e.currentTarget.value)}>
            {vals.map((e, i) => <option key={i} >{`${e}`}</option>)}
        </select>
    )
}

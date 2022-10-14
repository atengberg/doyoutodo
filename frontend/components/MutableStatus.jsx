import React, { useState } from "react";

import Dropdown from 'react-dropdown';
import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker/dist/entry.nostyle'

import { MdOutlineEditCalendar } from 'react-icons/md';
import { MdOutlineEditOff } from 'react-icons/md';

const getDefaultSelectedScheduledInterval = () => {
    const now = new Date();
    const anHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));
    return [ now, anHourFromNow ];
}

// by far the least favorite component to develop
const MutableStatus = ({ 
    status, 
    onStatusChanged, 
    scheduledInterval,
    realStartTime,
    realStopTime,
    disable,
    onEditStart,
    onEditingStopped
        }) => {

    switch (status) {
        case 'Scheduled':
            if (!scheduledInterval || scheduledInterval.length !== 2) {
                throw new Error("Status toggle scheduled without scheduled interval");
            }
            break;
        case 'Active':
            if (!realStartTime) {
                throw new Error("Status toggle active without real start time");
            }
            break;
        case 'Complete':
            if (!realStartTime || !realStopTime) {
                throw new Error("Status toggle complete without real start or stop time");
            }
    }

    const [ showDropDown, setShowDropDown ] = useState(false);
    const [ showScheduledOptions, setShowScheduledOptions ] = useState(false);
    const [ selectedScheduledInterval, setSelectedScheduledInterval ] = useState([]);
    const [ minDate, setMinDate ] = useState(new Date());

    const updateStatus = (newStatus, newScheduledInterval) => {
        onStatusChanged(newStatus, newScheduledInterval);
    }

    const resetSchedulingOptions = () => {
        const interval = getDefaultSelectedScheduledInterval();
        setSelectedScheduledInterval(interval);
        setMinDate(interval[0])
    }

    const startEditing = () => {
        if (disable) return;
        onEditStart("status");
        setShowDropDown(true);
        setShowScheduledOptions(status === 'Scheduled');
        resetSchedulingOptions();
    }

    const stopEditing = () => {
        setShowDropDown(false);
        setShowScheduledOptions(false);
        onEditingStopped();
    }

    const onSchedulingSwitched = ({ value }) => {
        if (value === 'Unscheduled') {
            // user switches to Unscheduled, no need to confirm
            stopEditing();
            updateStatus(value);
        } else {
            // user switches to Scheduled, show interval options and confirm
            setShowScheduledOptions(true);
            resetSchedulingOptions();
        }
    }

    const onSchedulingOptionsConfirmed = () => {
        stopEditing();
        updateStatus('Scheduled', selectedScheduledInterval);
    }

    const getActiveCompleteStatusToggle = () => {
        if (status === 'Unscheduled' || status === 'Scheduled') {
            return (
                <button className="button-85"
                    onClick={() => updateStatus('Active')}
                    disabled={showDropDown || disable}
                    >Activate
                </button> 
            ) 
        } else if (status === 'Active') {
            return (
                <button className="button-85"
                    disabled={disable || disable}
                    onClick={() => updateStatus('Complete')}
                    >Complete
                </button> 
            ) 
        } else {
            return null;
        }
    }

    const getDisplayedScheduledInterval = () => {
        // could be active or complete with scheduled interval
        if (scheduledInterval && scheduledInterval.length === 2) {
            const [ start, stop ] = scheduledInterval;
            const date = start.toDateString();
            let result = (status === 'Scheduled') ? '' : 'Scheduled';
            if (date === stop.toDateString()) {
                result += ` ${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${stop.toLocaleTimeString()}`;
            } else {
                result += `${start.toLocaleString()} - ${stop.toLocaleString()}`
            }
            return result;
        } else {
            return null;
        }
    }

    return (
        <div className="flex-column">
        <div className="flex-row">
            { showDropDown ?
                <Dropdown 
                    options={[
                        'Unscheduled',
                        'Scheduled',
                    ]} 
                    value={status} 
                    placeholder="Change Todo Status" 
                    onChange={onSchedulingSwitched} 
                />  
            :
                <span>{status}</span> 
            }
            { (status === 'Unscheduled') || (status === 'Scheduled') ?
                showDropDown ? 
                <MdOutlineEditOff onClick={stopEditing}/> 
                :
                <MdOutlineEditCalendar onClick={startEditing} />
            : null }
            <div className="flex-one"/>
            { getActiveCompleteStatusToggle() }
        </div>
        { showScheduledOptions ? 
            <div className="flex-row">
                <DateTimeRangePicker 
                    value={selectedScheduledInterval}
                    minDate={minDate}
                    onChange={(value) => setSelectedScheduledInterval(value ? value : getDefaultSelectedScheduledInterval())} 
                    />
                <button 
                    onClick={() => onSchedulingOptionsConfirmed()}
                    >Confirm
                </button>
            </div>
        : (status === 'Scheduled') ? 
            <>
            { getDisplayedScheduledInterval() }
            </>
        : null
        }
        { (status === 'Active') ? 
            <>Started {`${realStartTime.toLocaleString()}`} </>
            : null
        }
        { (status === 'Complete') ? 
            <>
                <div className="flex-row">Started {`${realStartTime.toLocaleString()}`} </div>
                <div className="flex-row">Completed {`${realStopTime.toLocaleString()}`} </div>
            </>
            : null
        }
        { ((status === 'Complete') || (status === 'Active')) ? 
            <div className="flex-row">
                { getDisplayedScheduledInterval() }
            </div>
            : null
        }
        </div>
    )
}


export default MutableStatus;




// each todo as it is represented in the canister is not the same form as that which the 
// client (views) use to display it. for instance, the canister uses nanoseconds for the timestamp
// while the views use the javascript date object. 

// more specifically, if the particular type is an opt, if it's value exists it is  
// accessed through its array element index (it'll be the 0th element in the array) as
// opt values are represented as arrays either containg its element or not. Below it 
// can be see that if a todo is complete (or active) and was previousily scheduled, the
// scheduled start and stop times are accessed this way. 
const todoViewModelTransform = (mTodo) => {
    mTodo = parse(mTodo);
    let todoVm = {
        id: mTodo.id,
        dateCreated: new Date(mTodo.epochCreationTime / 1000000),
        lastUpdated: new Date(mTodo.epochLastUpdateTime / 1000000),
        title: mTodo.title,
        description: mTodo.content,
        tags: mTodo.tags
    }
    // extracts the status from its variant representation, as the specific variant type 
    // will be the key the object of that variant, ie { ...currentScheduleStatus: { unscheduled: null } ... }
    // or { ...currentScheduleStatus: { scheduled: [ scheduledStart, scheduledStop ] } ...}
    // or { ...currentScheduleStatus: { completed: [ [ realStart, realStop ], [null] ] } ...} (null meananing wasn't scheduled)
    const status = `${(Object.keys(mTodo.currentScheduledStatus)[0])}`;
    todoVm.status = getStatusDisplayLiteral(status);

    // parse the status details
    switch (status) {
        case 'scheduled':
            let [ start, stop ] = mTodo.currentScheduledStatus.scheduled;
            todoVm.scheduledInterval = [
                new Date(start / 1000000),
                new Date(stop / 1000000)
            ];
            break;
        case 'active':
            let [ realStart, scheduledInterval ] = mTodo.currentScheduledStatus.active;
            todoVm.realStartTime = realStart / 1000000;
            if (scheduledInterval.length === 2) {
                let [ scheduledStart, scheduledStop ] = scheduledInterval;
                todoVm.scheduledInterval = [
                    new Date(scheduledStart / 1000000),
                    new Date(scheduledStop / 1000000)
                ];
            }
            break;
        case 'completed':
            let [ realInterval, scheduleInterval ] = mTodo.currentScheduledStatus.completed;
            let [ completedStart, completedStop ] = realInterval;
            todoVm.realStartTime = new Date(completedStart / 1000000);
            todoVm.realStopTime = new Date(completedStop / 1000000);
            if (scheduleInterval.length === 2) {
                let [ scheduledStart, scheduledStop ] = scheduleInterval;
                todoVm.scheduledInterval = [
                    new Date(scheduledStart / 1000000),
                    new Date(scheduledStop / 1000000)
                ];
            }
            break;
        case 'unscheduled': // nothing to parse
            break;
        default: throw new Error("Todo from canister did not have recognized currentScheduledStatus value");

    }
    return todoVm;
}

// todo status in canister is lower-case 
const getStatusDisplayLiteral = (status) => {
    switch (status) {
        case 'unscheduled': return 'Unscheduled';
        case 'scheduled': return 'Scheduled';
        case 'active': return 'Active'; 
        case 'completed': return 'Completed';
        default: throw new Error("Raw status field was not defined, could not convert to display literal");
    }
}

// work around for BigInt conversion for Time (Int)
const parse = (response) => JSON.parse(JSON.stringify(response));

const userProfileViewModelTransform = (mUserProfile) => {
    mUserProfile = parse(mUserProfile);
    return {
        dateCreated: new Date(mUserProfile.epochCreationTime / 1000000),
        lastUpdated: new Date(mUserProfile.epochLastUpdateTime / 1000000),
        principal: mUserProfile.associatedPrincipal,
        preferredName: mUserProfile.preferredDisplayName,
        emailAddress: mUserProfile.emailAddress,
        todoCount: mUserProfile.monotonicCreateTodoCount
    }
}

export default todoViewModelTransform;
export { userProfileViewModelTransform }
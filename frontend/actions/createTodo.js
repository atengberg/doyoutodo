
const callCanisterCreateTodo = async ({ canister, statusType, title, description, tags, scheduledInterval }) => {
    const methodSignatureArgumentFormat = {
        titleIn: [ title ],
        contentIn: [ description ], 
        tagsIn: [ tags ]
    }
    switch (statusType) {
        case 'Unscheduled':
            return await canister.addNewUnscheduledTodo({ ...methodSignatureArgumentFormat });
        case 'Scheduled':
            const [ start, stop ] = scheduledInterval;
            methodSignatureArgumentFormat.scheduledStartTime = start * 1000000;
            methodSignatureArgumentFormat.scheduledStopTime = stop * 1000000;
            return await canister.addNewScheduledTodo({ ...methodSignatureArgumentFormat });
        case 'Active':
            return await canister.addNewActiveTodo({ ...methodSignatureArgumentFormat });
        default:
            throw new Error("Tried to create todo without valid status");
    }
}

export default callCanisterCreateTodo;


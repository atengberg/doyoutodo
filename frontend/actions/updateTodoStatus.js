const callCanisterUpdateTodoStatus = async ({ canister, todoId, newStatus, scheduledInterval, previousStatus }) => {
    switch (newStatus) {
        case 'Scheduled':
            if (scheduledInterval) {
                if (previousStatus === 'Scheduled') {
                    //'reschedule_scheduled';
                    return await canister.rescheduleScheduledTodo({ 
                        todoIdIn: todoId,
                        newScheduledStartTime: scheduledInterval[0].getTime() * 1000000,
                        newScheduledStopTime: scheduledInterval[1].getTime() * 1000000
                    });
                } else if (previousStatus === 'Unscheduled') {
                    //'schedule_unscheduled';
                    return await canister.scheduledUnscheduledTodo({ 
                        todoIdIn: todoId,
                        scheduledStartTime: scheduledInterval[0].getTime() * 1000000,
                        scheduledStopTime: scheduledInterval[1].getTime() * 1000000
                    });
                } else {
                    throw new Error("Tried to rescheduled todo without correct args " + JSON.stringify({ newStatus, previousStatus }));
                }
            } else { 
                throw new Error("Tried to rescheduled todo without correct new scheduled interval"  + JSON.stringify({ newStatus, previousStatus, scheduledInterval }));
            }
        case 'Complete':
             // 'complete_active';
            return await canister.completeActiveTodo({ todoIdIn: todoId });
        case 'Active':
            // 'activate_existing';
            return await canister.activateScheduledOrUnscheduledTodo({ todoIdIn: todoId });
        case 'Unscheduled':
            // 'unscheduled_scheduled'
            return await canister.unscheduleScheduledTodo({ todoIdIn: todoId });
        default:
            throw new Error("Tried to rescheduled todo without correct args - fell to default case");
    }
}

export default callCanisterUpdateTodoStatus;

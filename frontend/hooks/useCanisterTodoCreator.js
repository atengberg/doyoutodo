import { useState } from 'react';
import { useCanister } from "@connect2ic/react";

import { getDeploymentCanisterName } from '../utils/constants';


export default function useCanisterTodoCreator(onTodoCreatedCallback) {

    const [ state, setState ] = useState({ isSubmitting: false, hadSuccess: false, errorMessage: "" });
    const { isSubmitting, hadSuccess, errorMessage } = state;
    const [ canister ] = useCanister(getDeploymentCanisterName());

    const call = async ({ addTodoType, titleIn, contentIn, tagsIn, scheduledIntervalIn }) => {
        // ??validation check prior
        setState({
            isSubmitting: true,
            hadSuccess: false,
            errorMessage: ""
        });
        const callCanister = async () => {
            const auth = async () => { return await canister.authenticateWithUserAccountCreationIfNecessary(); };
            console.log(JSON.stringify(auth()));

            const transmit = {
                titleIn: [ titleIn ],
                contentIn: [ contentIn ],
                tagsIn: [ tagsIn ]
            }
            let result;
            switch (addTodoType) {
                case 'unscheduled':
                    result = await canister.addNewUnscheduledTodo(transmit);
                    break;
                case 'active':
                    result = await canister.addNewActiveTodo(transmit);
                    break;
                case 'scheduled':
                    const { startTime, stopTime } = scheduledIntervalIn;
                    transmit.scheduledStartTime = startTime * 1000000;
                    transmit.scheduledStopTime = stopTime * 1000000;
                    result = await canister.addNewScheduledTodo(transmit);
                    break;
                default:
                    throw new Error("no todo type to create todo");
            }
            return result;
        }
    
        let result = null;
        try {
            result = await callCanister();
            console.log(JSON.stringify(result));
        } catch (e) {
            console.log("had error " + e + " while calling canister create todo ");
        } finally {
            setState({
                isSubmitting: false,
                hadSuccess: typeof result !== 'undefined',
                errorMessage: ""
            });
            if (typeof onTodoCreatedCallback !== 'undefined') {
                onTodoCreatedCallback();
            }
        }
    }

    return {
        isProcessing: isSubmitting,
        hadSuccess,
        errorMessage,
        callCanisterCreateTodo: call
    }
}
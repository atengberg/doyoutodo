import { useState } from 'react';
import { useCanister } from "@connect2ic/react";
import { getDeploymentCanisterName } from '../utils/constants';


export default function useCanisterTodoUpdater(todoId, onUpdateComplete) {
    if (typeof todoId === 'undefined' || typeof onUpdateComplete === 'undefined') {
      throw new Error("using canister Todo Updater with todo id or action complete callback");
    }

    const [ isProcessing, setIsProcessing ] = useState(false);

    const [ canister ] = useCanister(getDeploymentCanisterName());

    const call = async () => {
        setIsProcessing(() => true);
        const callCanister = async () => {
            let result;
            let error;
            try {
              let response = await canister.completeActiveTodo({ todoIdIn: todoId });
              if (typeof response.ok !== 'undefined') {
                result = response.ok; 
              } else {
                error = response.err;
              }
            } catch (e) {
              error = e.message;
            } finally {
              return { hadSuccess: typeof result !== 'undefined', result, error };
            }
        }
        const { hadSuccess, result, error } = await callCanister();

        setIsProcessing(() => false);
        if (typeof onUpdateComplete !== 'undefined') {
          onUpdateComplete();
        }
    }

    const callActivateExistingTodo = async () => {
      setIsProcessing(() => true);
      const callCanister = async () => {
          let result;
          let error;
          try {
            let response = await canister.activateScheduledOrUnscheduledTodo({ todoIdIn: todoId });
            if (typeof response.ok !== 'undefined') {
              result = response.ok; 
            } else {
              error = response.err;
            }
          } catch (e) {
            error = e.message;
          } finally {
            return { hadSuccess: typeof result !== 'undefined', result, error };
          }
      }
      const { hadSuccess, result, error } = await callCanister();

      setIsProcessing(() => false);
      if (typeof onUpdateComplete !== 'undefined') {
        onUpdateComplete();
      }
  }

    return {
        isProcessing,
        markTodoComplete: call,
        activateExistingTodo: callActivateExistingTodo
    }
} // const { isProcessing, markTodoComplete } = useCanisterTodoUpdater( ... .. )
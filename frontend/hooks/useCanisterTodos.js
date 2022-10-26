import { useState, useEffect } from 'react';

import callCanisterCreateTodo from '../actions/createTodo';
import callCanisterUpdateTodoStatus from '../actions/updateTodoStatus';
import callCanisterEditTodo from '../actions/editTodo';
import callCanisterQueryAllTodosOfUser from '../actions/queryTodos';
import callCanisterDeleteTodo from '../actions/deleteTodo';
import todoViewModelTransform from '../actions/viewModelTransforms';

// custom hook for doing CRUD operations on todos in canister
// note while some methods (such as delete) are simple, all the
// actions have been abstracted and can be found in /actions
// also note the useEffect queries all the todos when the
// user authenticates (is in the dependency array) which
// could also be cached in localstorage/indexdb in the future
// final note: probably can combine error/createError, contrived
// for the sake of using React router to show create as its own page
// a better ui would probably have create and updates done in a modal,
// thereby limiting the scope of what the user is exposed to to the
// context of their user interaction

const useCanisterTodos = (isConnected, principal, canister) => {
 
    // note the useCanister hook provides 2 state variables (result error), however I manually handle them
    // here to learn how to expect results from canisters
 
    const [ todos, setTodos ] = useState([]);
    const [ isLoading, setLoading ] = useState(false);
    const [ isUpdating, setUpdating ] = useState(false);
    const [ hasError, setError ] = useState(false);
    const [ hasCreateError, setCreateError ] = useState(false);

    const clearError = () => { setError(false); setCreateError(false); }

    const createTodo = async (todoDetails, callback) => {
        setUpdating(true);
        setCreateError(false);
        let error = false;
        try {
            let response = await callCanisterCreateTodo({ canister, ...todoDetails });
            if (response.ok) {
                updateList(response.ok.id, todoViewModelTransform(response.ok), true) 
            } else {
                setCreateError(response.err);
                error = true;
            }
        } catch (error) {
            console.error("Caught error trying to create new todo: " + error);
        } finally {
            setUpdating(false);
            if (!error) {
                callback();
            }
        }
    }

    const editTodo = async (todoId, field, newValue) => {
        setUpdating(true);
        setError(false);
        try {
            let response = await callCanisterEditTodo({ canister, todoId, field, newValue });
            response.ok ? 
                updateList(response.ok.id, todoViewModelTransform(response.ok)) 
                : 
                setError(response.err);
        } catch (error) {
            console.error("Caught error while trying to edit todo details: " + error.message)
        } finally {
            setUpdating(false);
        }
    }

    const updateTodoStatus = async (todoId, newStatus, scheduledInterval, previousStatus) => {
        setUpdating(true);
        setError(false);
        try {
            let response = await callCanisterUpdateTodoStatus({ canister, todoId, newStatus, scheduledInterval, previousStatus });
            response.ok ? 
                updateList(response.ok.id, todoViewModelTransform(response.ok)) 
                : 
                setError(response.err);
        } catch (error) {
            console.error("Caught error while trying to update todo status: " + error)
        } finally {
            setUpdating(false);
        }
    }

    const deleteTodo = async (todoId) => {
        setUpdating(true);
        setError(false);
        try {
            let response = await callCanisterDeleteTodo({ canister, todoId });
            response.ok ? updateList(todoId) : setError(response.err);
        } catch (error) {
            console.error("Caught error while trying to delete todo with id: " + error)
        } finally {
            setUpdating(false);
        }
    }

    // convience method to update todos used as state
    const updateList = (todoId, updatedTodo, wasCreated) => {
        let updatedTodos;
        if (updatedTodo) {
            if (wasCreated) {
                // todo was created, update the state adding the new todo
                updatedTodos = [...todos, updatedTodo ];
            } else {
                // todo was updated, update the state to reflect the changes
                updatedTodos = todos.map((todo) => todo.id === todoId ? { ...updatedTodo } : todo );
            }
        } else {
            // todo was deleted, update state to remove deleted todo
            updatedTodos = todos.filter((todo) => todo.id !== todoId);
        }
        setTodos(updatedTodos);
    }

    // loads the todos from a query made to the canister on component mount 
    // or if the refreshTrigger in dep array changes (ie, if updating feed oninterval)
    useEffect(() => {
        if (!isConnected || principal === '2vxsx-fae') return;
        let mounted = true;
        const query = async () => {
            try {
                setLoading(true);
                setUpdating(false);
                setError(false);
                await canister.authenticateWithUserAccountCreationIfNecessary();
                let response = await callCanisterQueryAllTodosOfUser({ canister });
                if (mounted) {
                    response.ok ? setTodos(response.ok.map(todoViewModelTransform)) : setError(response.err);
                }
            } catch (error) {
                console.error("Caught error while querying canister for todo list: " + error)
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (isConnected && principal !== '2vxsx-fae') {
            query();
        }
        // prevents memory leaks if the componented is unmounted and call unfinished
        return () => mounted = false;

    // note, here we could add a new todo in the same way todos of the list are updated
    // by adding a method create todo, however for the sake of learning react useEffect dependency array and router
    // (ie a "better" design would likely use the create and update flows in a modal)
    }, [ isConnected, principal, canister ])

    return {
        todos,
        isLoading,
        isUpdating,
        hasError,
        hasCreateError,
        clearError,
        createTodo,
        deleteTodo,
        updateTodoStatus,
        editTodo
    }
}

export default useCanisterTodos;


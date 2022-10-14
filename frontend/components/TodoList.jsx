import React, { useContext, useState } from 'react';
import styled from 'styled-components'

import { TodoContext } from "./TodoContextProvider";

import TodoCard from './TodoCard';
import LoadingIndicator from "../components/LoadingIndicator";
import ConfirmError from './ConfirmError';

const TodoList = () => {

    const {
        todos,
        isLoading,
        isUpdating,
        hasError,
        clearError,
        deleteTodo,
        updateTodoStatus,
        editTodo
    } = useContext(TodoContext);

    return (
        <SContainer>
        { isLoading ? 
            <LoadingIndicator />
            :
            <>
            { (isUpdating || hasError) ?
                <ListOverlay>
                    { isUpdating ? <LoadingIndicator displayText={isUpdating ? "updating" : "loading"} /> : null }
                    { hasError ? <ConfirmError errorMessage={hasError} onConfirmed={() => clearError()} /> : null }
                </ListOverlay>
                : null
            }
            { todos.length > 0 ? 
                <ListContainer blur={isUpdating || hasError }>
                    { todos.map((todo) => (
                        <TodoCard 
                            key={todo.id} 
                            {...todo}
                            updateTodoStatus={updateTodoStatus} 
                            editTodo={editTodo}
                            deleteTodo={deleteTodo}
                        />
                    ))}
                </ListContainer>
                :
                <>
                <SNoTodos>There are no todos to display</SNoTodos>
                </>
            }
            </>
        }
        </SContainer>
    )
}

const SContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    margin: 2rem 2rem;
`

const ListOverlay = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 90;
`

const SNoTodos = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20%;
`

const ListContainer = styled.div`
    z-index: 1;
    filter: ${props => props.blur ? "blur(.1em)" : null }
`




export default TodoList;
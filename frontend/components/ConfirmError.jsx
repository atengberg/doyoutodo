import React from 'react';
import styled from 'styled-components';

const ConfirmError = ({ errorMessage, onConfirmed, topMargin = "5%" }) => {
    if (!errorMessage) return;
    return (
        <SContainer marginTop={topMargin}>
            <span> { errorMessage } </span>
            <div className="flex-one"/>
            <SButton onClick={onConfirmed}>Ok</SButton>
        </SContainer>
    )
}

const SContainer = styled.div`
    width: 80%;
    background-color: white;
    border: 1px solid grey;
    margin: 1rem auto;
    margin-top: ${props => props.marginTop ? props.marginTop : "0em"};
    padding: 1rem;

    display: flex;
    align-items: center;

    span { color: red; }
`
const SButton = styled.button`
    padding: .25rem 1rem;
    border: 1px solid black;
`

export default ConfirmError;
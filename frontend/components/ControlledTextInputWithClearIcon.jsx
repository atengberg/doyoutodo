import React from 'react';
import styled from 'styled-components'


// <ControlledTextInputWithDelete label="test" value={val} onTextInputChanged={onTextInputChanged} />

const ControlledTextInputWithClearIcon = ({ placeHolder = "input some text", value = "", label, onTextInputChanged, inputRef }) => {
    if (typeof label !== "string" || label === "") throw Error("Must have label to assign onChange callback");
    if (typeof value === 'undefined') value = "";
    return (
        <SContainer>
            <SInput ref={inputRef} type="text" label={label} placeholder={placeHolder} value={value} onChange={(e) => onTextInputChanged(label, e.currentTarget.value)}/>
            <SDeleteInput onClick={() => onTextInputChanged(label, "", true)} show={value !== ""}>ⓧ</SDeleteInput>
        </SContainer>
    )
}

export default ControlledTextInputWithClearIcon;

const SContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    background: blue;
`

const SInput = styled.input`
    width: 100%;
    padding: .4rem 0;
`

const SDeleteInput = styled.div`
    width: 2rem;
    margin-left: -2rem;
    padding-left: .65rem;
    visibility: ${props => props.show ? "visible" : "hidden"};
`
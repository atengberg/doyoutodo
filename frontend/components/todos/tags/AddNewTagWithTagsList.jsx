import React, { useState } from 'react';
import useFocus from '../../hooks/useFocus';
import styled from 'styled-components'
import ControlledTextInputWithClearIcon from '../ControlledTextInputWithClearIcon';
import TagWithDeleteOnHover from './TagWithDeleteOnHover'

const AddNewTagTagsList = ({ tagsList }) => {

    const [ addedTags, setAddedTags ] = useState([]);

    const onAddNewTag = ({ tag }) => {
        if (!addedTags.includes(tag)) {
            setAddedTags([...addedTags, tag]);
        }
    }

    const onTagRemoved = ({ tagLiteral, index }) => {
        setAddedTags(addedTags.filter((tag, i) => index !== i));
    }

    return (
        <STagsListContainer>
            <AddTagInput onAddNewTag={onAddNewTag}/>
            
            <div className="unit-square-rem"/>
            <div className="tags-list-container">
                <ul>
                    {addedTags.length > 0 ?
                        addedTags.map((item, index) => <li key={index}><TagWithDeleteOnHover tagLiteral={item} index={index} onRemoveTag={onTagRemoved} /></li>)
                    : null }
                </ul>
            </div>
        </STagsListContainer>
    )
}


const AddTagInput = ({ onAddNewTag }) => {
    if (typeof onAddNewTag === 'undefined') throw new Error("using AddTagInput without add tag callback")
    const [ inputRef, setInputFocus ] = useFocus();
    const onAddInputStart = (e) => {
        setIsInputting(true); 
        setTimeout(() => { setInputFocus() }, 100);
    }
    const [ isInputting, setIsInputting ] = useState(false);
    const [ inputValue, setInputValue ] = useState("");
    const onTextInputChanged = (label, textInput, cleared = false) => {
        setInputValue(textInput);
        if (cleared) setIsInputting(false);
    }
    const addNewTagClicked = (e) => {
        if (inputValue !== "") {
            onAddNewTag({ tag: inputValue });
            onTextInputChanged(null, "", true);
        }
    }
    return (
        <SWrapperWithBorder>
            <AddLabelAndInputWrapper>
                <SAddTagLabelButton onClick={onAddInputStart} isInputting={isInputting}>
                    Add Tag <span className="icon">⊕</span>
                </SAddTagLabelButton>
                <InputWrapper isInputting={isInputting}>
                    <ControlledTextInputWithClearIcon label="tagInput" value={inputValue} onTextInputChanged={onTextInputChanged} inputRef={inputRef} />
                    <AddInputAsTagButton onClick={addNewTagClicked} hasInput={inputValue !== ""}><span className="icon">⊕</span></AddInputAsTagButton>
                </InputWrapper>
            </AddLabelAndInputWrapper>
        </SWrapperWithBorder>
    )
}

const SWrapperWithBorder = styled.div`
    height: 3em;
    display: inline-flex;
    flex-direction: row; align-items: center;
    width: 10em;

    .icon {
        font-size: x-large;
    }
`

const AddLabelAndInputWrapper = styled.div`
    display: inline-flex; flex-direction: row; align-items: center;
`

const InputWrapper = styled.div`
    width: 100%;
    height: 100%;
    display: ${props => props.isInputting ? "inline-flex" : "none" };
    flex-direction: row; align-items: center;
`

const AddInputAsTagButton = styled.div`
    width: 2em;
    padding: 0 1rem;
    height: 100%;
    display: flex; flex-direction: row; align-items: center; justify-content: center;
    opacity: ${props => props.hasInput ? "1" : ".5" };
`

const SAddTagLabelButton = styled.div`
    display: ${props => props.isInputting ? "none" : "inline-flex" };
    padding: 0 .25rem;

    justify-content: flex-end;
    align-items: center;
    width: 9.65em;

    .icon {
        padding: 0 .5rem;
    }
`

const STagsListContainer = styled.div`
    
    border: 1px solid black;
    padding: .25rem;
    display: inline-flex;

    .tags-list-container {
        display: inline-flex;

        align-items: center;

        ul {
            list-style-type: none;
            display: inline-flex;
            align-items: center;

            li {
                padding: 0;
            }
        }
    }
`

export default AddNewTagTagsList;

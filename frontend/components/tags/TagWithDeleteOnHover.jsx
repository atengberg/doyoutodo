import React, {useState} from 'react';
import styled from 'styled-components'

const TagWithDeleteOnHover = ({ tagLiteral, index, onRemoveTag }) => {
    if (tagLiteral === "") throw Error("No tag literal to show");
    const removeClicked = () => onRemoveTag({ tagLiteral, index });
    const [isHovering, setIsHovering] = useState(false);
    const mouseEnter = e => setIsHovering(true);
    const mouseLeave = e => setIsHovering(false);
    return (
        <STagElementContainer onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
            <STagElementLiteral>#{tagLiteral}</STagElementLiteral>
            <SDeleteTag showRemove={isHovering} disabled={!isHovering} onClick={() => removeClicked()}>ⓧ</SDeleteTag>
        </STagElementContainer>
    )
}

const STagElementContainer = styled.div`
    padding: .5rem .1rem;
    display: inline-flex;
    align-items: center;
`

const STagElementLiteral = styled.div`
    display: flex;
    align-items: center;
`

const SDeleteTag = styled.div`
    visibility: ${props => props.showRemove ? "visible" : "hidden" };
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-left: .2rem;
    width: 1rem;
    font-size: large;
    cursor: pointer;
`

export default TagWithDeleteOnHover;
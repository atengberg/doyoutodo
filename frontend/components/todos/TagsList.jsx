import React from 'react';
import styled from 'styled-components'

export default function TagsList({ tags = [] }) {
    return (
        <>
            { tags.length > 0 ? <STagsList>{
                tags.map((e, index) => (<TagKeyword key={index}>{`#${e}`}</TagKeyword>))
            }</STagsList> : `no tags`}
        </>
    )
}

const STagsList = styled.ul`
    list-style-type: none;
    display: flex;
    flex-direction: row;
`

const TagKeyword = styled.li`
    padding: .25em 1em;
    margin: 0 .5em;
    border: 1px solid black;
`
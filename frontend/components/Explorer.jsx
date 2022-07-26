import React, { useState } from 'react';
import styled from 'styled-components';

import useWindowSize from '../hooks/useWindowSize';

import ReadOnlyTodosList from './todos/ReadOnlyTodosList';

export default function Explorer() {

    const { width, height } = useWindowSize();
    
    let adjustedHeight = parseInt(height * .89);
    
    // to prevent react collapse displaying a warning in dev mode when height is nan
    if (isNaN(adjustedHeight)) adjustedHeight = 0;
    
    const [ frameDimensions, setFrameDimensions ] = useState({w: width, h: adjustedHeight});

    return (
        <Sframe width={frameDimensions.w} height={frameDimensions.h} >
            <Stitle>Top Public</Stitle>
            <ReadOnlyTodosList />
            Here go all publically accessible todos
        </Sframe>
    )
}

const Stitle = styled.div`
    padding: 2rem;
    font-size: 1.5em;
    font-weight: 600;
    text-shadow: 1px 2px 1px hsla(210, 90%, 89%, 1);
`


const Sframe = styled.div`

    width: ${props => props.width};
    height: ${props => props.height};    min-height: ${props => props.height};
    
    display: flex;
    flex-direction: column;
`
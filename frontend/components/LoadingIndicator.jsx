import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingIndicator = ({ displayText = "loading" }) => {
    return (
        <SContainer>
            <SAnimated>{ displayText } </SAnimated>
        </SContainer>
    )
}

const loadingAnimation = keyframes`
    11%      { opacity: .8; text-shadow: 0px -3px 3px hsla(0, 70%, 50%, 1) }
    22%     { opacity: .7; text-shadow: 3px -3px 3px hsla(45, 70%, 50%, 1) }
    33%     { opacity: .6; text-shadow: 3px 0px 3px hsla(90, 70%, 50%, 1) }
    44%    { opacity: .5; text-shadow: 3px 3px 3px hsla(135, 70%, 50%, 1) }
    55%    { opacity: .4; text-shadow: 0px 3px 3px hsla(180, 70%, 50%, 1) }
    66%    { opacity: .5; text-shadow: -3px 3px 3px hsla(225, 70%, 50%, 1) }
    77%    { opacity: .6; text-shadow: -3px 0px 3px hsla(270, 70%, 50%, 1) }
    88%    { opacity: .7; text-shadow: -3px -3px 3px hsla(315, 70%, 50%, 1) }
    100%    { opacity: .8; text-shadow: 0px -3px 3px hsla(360, 70%, 50%, 1); }
`

const SAnimated = styled.span`
    font-size: 1em;
    animation-name: ${loadingAnimation};
    animation-duration: 1.2s;
    animation-iteration-count: infinite;
`

const SContainer = styled.div`
    width: 100%;
    height: 5em;

    margin: 1rem auto;
    padding: 1rem;

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
`

export default LoadingIndicator;
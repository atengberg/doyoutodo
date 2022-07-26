import React from 'react';
import styled, { keyframes } from 'styled-components';
import logo from "../assets/logo-doYou.png";

export default function Splash({ exploreClicked }) {

    const getRandomSecondsCount = () => {
        let unit = Math.random();
        let scaled = unit * 8;
        let offset = scaled + 3;
        offset = offset < 4 ? 4 : offset;
        offset = offset > 10 ? 10: offset;
        return offset;
    }

    return (       
        <SWrapper>

            <CenterPanel>
                <div className="flex-one"/>
                <div className="flex-one">
                    <SplashLogo src={logo} randomSeconds={getRandomSecondsCount()} />
                </div>
                <div className="unit-square-rem" />    
                <div className="unit-square-rem" />
                
                <TitleStack>
                    <div>DoYou Todo</div>
                    <div>on the</div>
                    <div>Internet Computer</div>

                </TitleStack>
                <div className="flex-one"/>

            </CenterPanel>
            <Subtitle><Href onClick={exploreClicked}>Explore</Href> Public Listings or use the API</Subtitle>

        </SWrapper>
    )
}

const Href = styled.a`
    text-decoration: dotted underline;
`

const Subtitle = styled.div`
    font-size: 1.3em;
`

const CenterPanel = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`

const TitleStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    font-size: 3em;
    text-shadow: 1px 2px 3px hsla(240, 60%, 30%, .5);
`

const SWrapper = styled.div`
    margin-top: 6rem;
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const HueRotate = keyframes`
    0% { 
        filter: hue-rotate(0deg); }
    10% { 
        filter: hue-rotate(36deg); }
    20% { 
        filter: hue-rotate(66deg); }
    30% { 
        filter: hue-rotate(99deg), contrast(4); }
    40% { 
        filter: hue-rotate(130deg), invert(.9); }
    50% { 
        filter: hue-rotate(167deg); }
    60% { 
        filter: hue-rotate(210deg), contrast(8), grayscale(10%); }
    70% { 
        filter: hue-rotate(249deg), invert(.4), grayscale(100%); }
    80% { 
        filter: hue-rotate(294deg), contrast(7), grayscale(10%); }
    90% { 
        filter: hue-rotate(330deg), saturate(10), grayscale(0%); }
    100% { 
        filter: hue-rotate(360deg), ;}
`

const SplashLogo = styled.img`
    animation-name: ${HueRotate};
    animation-duration: ${props => props.randomSeconds}s;
    animation-iteration-count: infinite;
`



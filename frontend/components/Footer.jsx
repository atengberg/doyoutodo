import React from 'react';
import styled from 'styled-components';

export default function Footer() {

    return (
        <SFooter>
            <SLink className="text">About</SLink>
            <div className="unit-square-rem"/>
            <SLink className="text">Help</SLink>
            <div className="unit-square-rem"/>
            <SLink className="text">Contact</SLink>
            <div className="flex-one"/>
            <span className="text">
                <span className="emphasis">DoYou Internet Computer Powered Personal Chronometer </span> 
                made possible by a grant from <span className="emphasis">Dfinity</span></span>
        </SFooter>
    )
}

const SFooter = styled.div`
  height: 2.5rem;
  width: 100%;
  background-color: black;
  box-shadow: inset 0px 5px 5px hsla(200, 100%, 90%, .5);
  display: flex;
  align-items: center;
  padding: 0 1rem;

  .text {
    color: hsla(200, 100%, 90%, .5);
  }

  .emphasis {
    color: hsla(200, 100%, 90%, .8);    
    font-weight: 400;
  }
`

const SLink = styled.span`

  cursor: pointer;

  &:hover {
    color: hsla(200, 100%, 90%, .8);    
    font-weight: 500;
  }

`
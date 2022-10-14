import React from "react";
import styled from "styled-components";

const About = () => {
    return (
        <SText>
            <div className="one-rem-padding" />

            This decentralized app ("dapp") was created to demonstrate how the Internet Computer Protocol ("ICP") created by Dfinity provides developers with a full-stack solution connecting web2 to web3 and beyond. Among other capabilities, ICP smart contracts ("canisters") can not only host the front-end but also operate as the back-end, unifying the full-stack developer experience encoded in the usability of smart contracts. What's more, smart contracts on the IC can directly sign to other blockchains without the need and vulnerability of bridges, to empower developers and their users to seamlessly participate in the technological revolution blockchain has initiated. If you missed out on the opportunity of buying bitcoin for a few cents on the dollar wishing you had when you had the chance, the Internet Computer is your chance to get in on the ground floor of what's to come.
            
            <div className="one-rem-padding"/>
            <p>
            Read the <a href={"nyi"}>full article</a>
            </p>

            <p>

            </p>
        </SText>
    )
}

const SText = styled.div`
    width: 80%;
    margin: 1em auto;
    font-size: 1.5rem;

    a {
        color: purple
    }
`




export default About;
import React from "react";
import styled from "styled-components";

const About = () => {
    return (
        <SText>
            <div className="one-rem-padding" />

            This decentralized app ("dapp") was created to demonstrate how the Internet Computer Protocol ("ICP") created by Dfinity provides developers with a full-stack solution connecting web2 to web3 and beyond. Among other capabilities, ICP smart contracts ("canisters") can not only host the front-end but also operate as the back-end, unifying the full-stack developer experience encoded in the usability of smart contracts. What's more, smart contracts on the IC can directly sign to other blockchains without the need and vulnerability of bridges, to empower developers and their users to seamlessly participate in the technological revolution blockchain has initiated. If you missed out on the opportunity of buying bitcoin for a few cents on the dollar wishing you had when you had the chance, the Internet Computer is your chance to get in on the ground floor of what's still to come...
            
            <div className="one-rem-padding"/>
            <p>
            Read the <a href={"https://medium.com/@atengberg/introducing-doyou-todo-on-the-internet-computer-f78cc632a57c"}>full introductory article</a>
            </p>
            <div className="one-rem-padding"/>
            <p>
            At the core of this project is the todo. Building off the sample code Dfinity provided, the primary feature of a todo is its status: while a todo has all the usual metadata (date created, last updated, title, description, tags, author) to demonstrate Motoko and in particular variants (a type of enumeration), the status of a todo was created around the idea of a todo having a life cycle: 
            </p>
            <ul>
                <li>A todo can be created by the user as either unscheduled, scheduled or active.</li>
                <li>An unscheduled todo can be scheduled; a scheduled todo can be rescheduled or unscheduled. A scheduled todo also always has a planned start and stop time. A scheduled or unscheduled todo can be ‘activated’ turning its status to active.</li>
                <li>An active todo always has a real start time.</li>
                <li>An active todo can finally be completed, so that a complete todo will always have a real start and stop time. If the todo was previously scheduled before being activated and then completed, it will also have a scheduled start and stop time.</li>
            </ul>
            <p>
            Check out the rest of the developer notes at the <a href={"https://medium.com/@atengberg/introducing-doyou-todo-on-the-internet-computer-f78cc632a57c"}>Github repository</a>
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

import React from "react";
import styled from "styled-components";

import CreateTodo from "../components/CreateTodo";

const Create = () => {
    return (
        <SConainter>
            <CreateTodo />
        </SConainter>
    )
}

const SConainter = styled.div`
    width: 90%;
    margin: 1rem auto;
    padding: 2rem;
`

export default Create;
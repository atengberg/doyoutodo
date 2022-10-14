import React from "react";

import useUserProfile from "../hooks/useUserProfile";

import MutableUserProfile from "../components/MutableUserProfile";
import LoadingIndicator from "../components/LoadingIndicator";
import ConfirmError from "../components/ConfirmError";


import { useCanister } from "@connect2ic/react";

const Profile = () => {

    const [ canister ] = useCanister("main");

    const { 
        isLoading, 
        error, 
        clearError,
        userProfile,
        updateUserProfile,
    } = useUserProfile(canister);

    return (
        <>
            { error ?
                <ConfirmError errorMessage={error}  onConfirmed={() => clearError()} /> : null
            } 
            { isLoading ?
                <LoadingIndicator />
            :
                <MutableUserProfile 
                    {...userProfile}
                    onUpdateUserProfile={(newValues) => updateUserProfile(newValues)}
                />
            }
        </>
    )
}

export default Profile;
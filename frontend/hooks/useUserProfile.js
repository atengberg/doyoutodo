import { useState, useEffect } from "react";

import { userProfileViewModelTransform } from "../actions/viewModelTransforms";
import callCanisterQueryUserProfile from "../actions/queryUserProfile";
import callCanisterUpdateProfile from "../actions/updateUserProfile";

// hook that queries user profile and provides state of that profile, 
const useUserProfile = (canister) => {

    const [ isLoading, setIsLoading ] = useState(false);
    const [ hasError, setError ] = useState(false);

    const clearError = () => setError(false);

    const [ userProfile, setUserProfile ] = useState({
        dateCreated: new Date(),
        lastUpdated: new Date(),
        principal: "",
        preferredName: "",
        emailAddress: "",
        todoCount: 0
    })

    const updateUserProfile = async ({ newName, newEmail }) => {
        setError(false);
        setIsLoading(true);
        try {
            let response = await callCanisterUpdateProfile({ canister, newName, newEmail });
            response.ok ? setUserProfile({ ...(userProfileViewModelTransform(response.ok)) }) : setError(response.err);
        } catch (error) {
            console.log("Caught error while updating user profile: " + error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        setError(false);

        const query = async () => {
            try {
                let response = await callCanisterQueryUserProfile({ canister });
                if (mounted) {
                    response.ok ? setUserProfile({ ...(userProfileViewModelTransform(response.ok)) }) : setError(response.err);
                }
            } catch (error) {
                console.log("Caught error while querying user profile: " + error);
            } finally {
                setIsLoading(false);
            }
        }
        query();
        return () => mounted = false;
    }, [])

    return { 
        isLoading, 
        hasError, 
        clearError,
        userProfile, 
        updateUserProfile,  
    }
}

export default useUserProfile;


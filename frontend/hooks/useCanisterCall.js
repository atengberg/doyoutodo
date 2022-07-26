import { useReducer, useEffect, useState } from "react";
import { useCanister } from "@connect2ic/react";


// idea CRUD callbacks trigger updates to backend which then causes local state to update which then triggers the useeffect to get backend data 
export default function useCanisterCall() {

    const [ mainLocal ] = useCanister("main_local");

    const [ isAwaiting, setIsAwaiting ] = useState(false);
    const [ data, setData ] = useState("");

    useEffect(() => {
        let mounted = true;
        setIsAwaiting(() => true);
        const doQuery = async () => {
            const query = async () => {
                return await mainLocal.greet();
            }
            return await query();
        }
        const results = doQuery();
        if (mounted) {
            setData(() => results);
        }
        setIsAwaiting(() => false);
        return () => mounted = false;
    }, []);

    const onRefresh = (val = "x") => {
        setData(() => val + val);
    };

    return {
        isAwaiting,
        data,
    };
}


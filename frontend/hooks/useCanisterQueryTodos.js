import { useState } from 'react';
import { useCanister } from "@connect2ic/react";
import { getDeploymentCanisterName } from '../utils/constants';


export default function useCanisterQueryTodos(onResults) {

    const [ isProcessing, setIsProcessing ] = useState(false);

    const [ canister ] = useCanister(getDeploymentCanisterName());

    const call = async () => {
        setIsProcessing(() => true);
        const callCanister = async () => {
            let result;
            let error;
            try {
              let response = await canister.queryAllTodosOfUser();
              if (typeof response.ok !== 'undefined') {
                result = response.ok; 
              } else {
                error = response.err;
              }
            } catch (e) {
                console.log("Non trivial error while trying to parse canister result");
              error = e.message;
            } finally {
              return { hadSuccess: typeof result !== 'undefined', result, error };
            }
        }
        const { hadSuccess, result, error } = await callCanister();

        let results = result.map((e) => {
          e = JSON.parse(JSON.stringify(e));
          let res = {
            todoId: e.id,
            //authorDisplayName: "",
            dateCreatedEpoch: e.epochCreationTime / 1000000,
            dateLastUpdatedEpoch: e.epochLastUpdateTime / 1000000,
            title: e.title,
            content: e.content,
            tags: e.tags
          }
          let scheduleStatus = `${(Object.keys(e.currentScheduledStatus)[0])}`;
          res.scheduleStatus = scheduleStatus;
          switch (scheduleStatus) {
            case 'scheduled': 
              let [ start, stop ] = e.currentScheduledStatus.scheduled;
              res.nominalInterimStart = start / 1000000;
              res.nominalInterimStop = stop / 1000000;
              break;
            case 'active':
              let [ realStart, nomInterval ] = e.currentScheduledStatus.active;
              res.realInterimStart = realStart / 1000000;
              if (nomInterval.length === 2) {
                let [ start, stop ] = nomInterval;
                res.nominalInterimStart = start / 1000000;
                res.nominalInterimStop = stop / 1000000;
              }
              break;
            case 'completed':
              let [ realInterval, nominalInterval ] = e.currentScheduledStatus.completed;
              let [ realStar, realSto ] = realInterval;
              res.realInterimStart = realStar / 1000000;
              res.realInterimStop = realSto / 1000000;
              if (nominalInterval.length === 2) {
                let [ start, stop ] = nominalInterval;
                res.nominalInterimStart = start / 1000000;
                res.nominalInterimStop = stop / 1000000;
              }
            break;
          }
          return res; 
        });
        setIsProcessing(() => false);
        onResults(results);
      }

    return {
        isProcessing,
        queryCanisterForTodos: call
    }
}
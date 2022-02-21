import axios from "axios";
import { useQuery } from "react-query";

async function getJobData(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/Job?id=${id}`);
    return data;
}

export function useJobData(id){
    const { data } = useQuery(['jobData', id], () => getJobData(id),{
        enabled: !!id,
        staleTime: 30000,
    });
    return data;
}

async function getAllJobData(){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/Job/getJobs`);
    return data;
}

export function useAllJobData(){
    const { data } = useQuery(['allJobs'], () => getAllJobData(),{
        staleTime: 30000,
    });
    return data;
}
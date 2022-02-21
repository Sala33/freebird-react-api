import axios from "axios";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useQuery } from 'react-query';
import { callApiWithToken, callAxiosApiWithToken, patchAxiosApiWithToken } from "../api/fetch";
import { protectedResources } from "../authConfig";
import { db } from "../utils/firebase";

async function getUserData(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/UserInfo?id=${id}`);
    return data;
}

// export function useUserData(id){
//     const { data } = useQuery(['userData', id], () => getUserData(id),
//     {
//         enabled: !!id,
//         staleTime: 10000,
//     });
//     return data;
// }
async function getUserAvatar(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/UserInfo/getAvatar?id=${id}`);
    return data;
}

export function useUserAvatar(id){
    const { data } = useQuery(['userAvatar', id], () => getUserAvatar(id),
    {
        enabled: !!id,
        staleTime: 100000,
    });
    return data;
}

async function getUserExists(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/UserInfo/userExists?id=${id}`);
    return data;
}

export function useUserExists(id){
    const { data } = useQuery(['userExists', id], () => getUserExists(id),
    {
        enabled: !!id,
        staleTime: 100000,
    });
    return data;
}
async function getAllUsers(limit){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/UserInfo/getUsers?number=${limit}`);
    return data;
}

export function useUsers(limit){
    const { data } = useQuery(['userQuery', limit], () => getAllUsers(limit),
    {
        staleTime: 100000,
    });
    return data;
}

async function getAuthUserData(accessToken){
    const { data } = await callAxiosApiWithToken(accessToken, `${process.env.REACT_APP_API_SSL}/api/UserInfo`);
    return data;
}

export function useUserAuthData(accessToken){
    const { data } = useQuery(['currentUserData'], () => getAuthUserData(accessToken), 
    { 
        enabled: !!accessToken,
        staleTime: 10000,
    });
    return data;
}

export function patchUserData(params){
    const { accessToken, parameters } = params;
    const { data } = patchAxiosApiWithToken(accessToken, `${process.env.REACT_APP_API_SSL}/api/UserInfo`, parameters);
    return data;
}

export function useTests(account, inProgress, instance){
    if (account && inProgress === "none") {
        instance.acquireTokenSilent({
            scopes: protectedResources.forecast.scopes,
            account: account
        }).then((response) => {
            callApiWithToken(response.accessToken, protectedResources.forecast.endpoint)
                .then(response => console.log(response));
        })
    }
}

async function getWeatherData(accessToken){
    const { data } = await callAxiosApiWithToken(accessToken, `${process.env.REACT_APP_API_SSL}/WeatherForecast`);
    return data;
}

export function useWeatherTest(token){
    const { data } = useQuery(['currentUserData'], () => getWeatherData(token), 
    { 
        enabled: !!token,
        staleTime: 10000,
    });
    return data;
}

export function useUsersData(){
    const data = useQuery(['usersData'], getUsers,{
        staleTime: 60000,
    });
    return data;
}


async function getUsers(){
    const querySnapshot = await getDocs(collection(db, 'users'));
    let usersList = [];
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        usersList.push(doc.data());
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return usersList;
};

export function useUserData(uid){
    const data = useQuery(['usersData', uid], () => getUser(uid),{
        staleTime: 600000,
        enabled: !!uid
    });
    return data;
}

export function useUserDataUrl(url){

    const data = useQuery(['usersData', url], () => getUserFromUrl(url),{
        staleTime: 600000,
        enabled: !!url
    });
    
    return data;
}


async function getUser(uid){
    const q = query(collection(db, 'users'), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    let userResult = null;
    if(!querySnapshot.empty){
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;
            userResult = user;
        });
        return userResult;
    }
    else{
        throw new Error('Usuário não encontrado');
    }
};

async function getUserFromUrl(uid){
    const q = query(collection(db, 'users'), where('url', "==", uid));
    const querySnapshot = await getDocs(q);
    let userResult = null;
    if(!querySnapshot.empty){
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;
            userResult = user;
        });
        return userResult;
    }
    else{
        
        const q = query(collection(db, 'users'), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        let userResult = null;
        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                user.id = doc.id;
                userResult = user;
            });
            return userResult;
        } else {
            throw new Error('Usuário não encontrado');
        }
    }
};
import { useQuery } from 'react-query'
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export function useTramposData(){
    const data = useQuery(['tramposData'], getTrampos,{
        staleTime: 60000,
    });
    return data;
}

async function getTrampos(){
    const querySnapshot = await getDocs(collection(db, 'trampos'));
    let tramposList = [];
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        tramposList[doc.id] = doc.data();
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return tramposList;
};

export function useUserTramposData(uid){
    const data = useQuery(['tramposData'], () => getTramposOwner(uid),{
        staleTime: 60000,
        enabled: !!uid
    });
    return data;
}

async function getTramposOwner(owner){
    const q = query(collection(db, 'trampos'), where("owner", "==", owner));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        let tramposData = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const c = doc.data();
            c.id = doc.id;
            tramposData.push(c);
            // console.log(doc.id, " => ", doc.data());
            });
        return tramposData;                
    }
    return null;
};
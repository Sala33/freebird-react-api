import { useQuery } from 'react-query'
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export function useOportunidadesData(){
    const data = useQuery(['oportunidadesData'], getOportunidades,{
        staleTime: 60000,
    });
    return data;
}

async function getOportunidades(){
    const querySnapshot = await getDocs(collection(db, 'oportunidades'));
    let oportunidadesList = [];
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        oportunidadesList[doc.id] = doc.data();
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return oportunidadesList;
};

export function useUserOportunidadesData(uid){
    const data = useQuery(['oportunidadesData', uid], () => getOportunidadesData(uid),{
        staleTime: 60000,
        enabled: !!uid
    });
    return data;
}

async function getOportunidadesData(uid){
    const q = query(collection(db, 'oportunidades'), where("owner", "==", uid));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        let oportunidadesData = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            oportunidadesData.push(doc.data());
            // console.log(doc.id, " => ", doc.data());
        });
        return oportunidadesData;
    }
    return null;
};
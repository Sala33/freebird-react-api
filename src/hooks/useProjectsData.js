import axios from "axios";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { db } from "../utils/firebase";

async function getProjectsData(){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/Projects`);
    return data;
}

export function useProjectsData(){
    const data = useQuery(['projectsData'], getProjetos,{
        staleTime: 60000,
    });
    return data;
}

async function getProjetos(){
    const querySnapshot = await getDocs(collection(db, 'projetos'));
    let projetosList = [];
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    projetosList.push(doc.data());
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return projetosList;
};

export function useProjectsDataObject(){
    const data = useQuery(['projectsDataObject'], getProjectsObject,{
        staleTime: 60000,
    });
    return data;
}

async function getProjectsObject(){
    const querySnapshot = await getDocs(collection(db, 'projetos'));
    let projetosList = [];
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        projetosList[doc.id] = doc.data();
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return projetosList;
};

export function useUserProjectsData(uid){
    const data = useQuery(['projectsData', uid], () => getUserProjetosData(uid),{
        staleTime: 60000,
        enabled: !!uid
    });
    return data;
}

async function getUserProjetosData(uid){
    const q = query(collection(db, 'projetos'), where("owner", "==", uid));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        let projetosData = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const c = doc.data();
            c.id = doc.id;
            projetosData.push(c);
            // console.log(doc.id, " => ", doc.data());
        });
        return projetosData;
    }
    return null;
};
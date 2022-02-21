import { useQuery } from 'react-query'
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../utils/firebase";

export function useProdutorasData(){
    const data = useQuery(['produtorasData'], getProdutoras,{
        staleTime: 60000,
    });
    return data;
}

async function getProdutoras(){
    const querySnapshot = await getDocs(collection(db, 'produtoras'));
    let produtorasList = {};
    querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
        const cp = doc.data();
        cp.owner = doc.id;
        produtorasList[doc.id] = cp;
    });
    // tramposList = tramposList.filter((e) => e.owner !== ownerID);
    return produtorasList;
};


export function useProdutoraData(url){
    const data = useQuery(['produtorasData', url], () => getProdutoraData(url),{
        staleTime: 60000,
        enabled: !!url
    });
    return data;
}

async function getProdutoraData(prod){
    const q = query(collection(db, 'produtoras'), where("url", "==", prod));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        let result = null
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            d.id = doc.id;
            result = d;
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
        });
        return result;
    } else {
        //See if it was passed the id
        const docRef = doc(db, "produtoras", prod);
        const docSnap = await getDoc(docRef);
        let result = null
        if (docSnap.exists()) {
            const d = docSnap.data();
            d.id = docSnap.id;
            result = d;
            return result;
        } else {
            return null;
        }
    }

};
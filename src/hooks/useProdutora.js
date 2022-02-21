import { useQuery } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

async function prodExists(uid){
    const docRef = doc(db, "produtoras", uid);
    const docSnap = await getDoc(docRef);
    return docSnap;
}

export function useProdutora(uid){
    const data = useQuery(['allJobs'], () => prodExists(uid),{
        enabled: !!uid
    });
    return data;
}
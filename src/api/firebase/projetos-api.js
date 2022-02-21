import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../utils/firebase";

// async function getProjetosData(uid){
//     const q = query(collection(db, 'projetos'), where("owner", "==", uid));
//     const querySnapshot = await getDocs(q);
//     if(!querySnapshot.empty){
//         let projetosData = [];
//         querySnapshot.forEach((doc) => {
//             // doc.data() is never undefined for query doc snapshots
//             projetosData.push(doc.data());
//             // console.log(doc.id, " => ", doc.data());
//             });
//         setProjetos(projetosData);
//     }
// };
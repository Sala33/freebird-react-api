import axios from "axios";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useQuery } from "react-query";
import { db } from "../utils/firebase";

async function getReview(){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/Review`);
    return data;
}

export function useReviews(){
    const { data } = useQuery(['userReviews'], () => getReview(),
    {
        staleTime: 600,
    });
    return data;
}

async function getRating(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/Review/getRating?id=${id}`);
    return data;
}

export function useRating(id){
    const { data } = useQuery(['userRating', id], () => getRating(id),
    {
        enabled: !!id,
        staleTime: 10000,
    });
    return data;
}

export function useUserReviews(uid, type){
    const data = useQuery(['userReviews'], () => getReviewsData(uid, type),
    {
        staleTime: 60,
        enabled: !!uid
    });
    return data;
}

async function getReviewsData(uid, type){
    const q = query(collection(db, 'reviews'), where("owner", "==", uid));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot.empty){
        let reviewsData = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const review = doc.data();
            if(review.tipo === type){
                review.id = doc.id;
                reviewsData.push(review);   
            }
            // console.log(doc.id, " => ", doc.data());
        });
        return reviewsData;
    }
    return null;
};
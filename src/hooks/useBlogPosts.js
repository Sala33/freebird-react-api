import axios from "axios";
import { useQuery } from "react-query";
import { postAxiosApiWithToken } from "../api/fetch";

async function getBlogPost(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/BlogPost?id=${id}`);
    return data;
}

export function useBlogPost(id){
    const { data } = useQuery(['blogPost', id], () => getBlogPost(id),
    {
        staleTime: 10000,
    });
    return data;
}
async function getAllPost(id){
    const { data } = await axios.get(`${process.env.REACT_APP_API_SSL}/api/BlogPost/getPosts?id=${id}`);
    return data;
}

export function useAllBlogPosts(id){
    const { data } = useQuery(['blogPosts', id], () => getAllPost(id),
    {
        enabled: !!id,
        staleTime: 10000,
    });
    return data;
}

export function postBlogPost(params){
    const { accessToken, parameters } = params;
    const { data } = postAxiosApiWithToken(accessToken, `${process.env.REACT_APP_API_SSL}/api/BlogPost`, parameters);
    return data;
}
/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import axios from "axios";

export const callApiWithToken = async(accessToken, apiEndpoint) => {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);

    const options = {
        method: "GET",
        headers: headers
    };

    return fetch(apiEndpoint, options)
        .then(response => response.json())
        .catch(error => console.log(error));
};

export const callAxiosApiWithToken = async(accessToken, apiEndpoint) => {
    
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    return axios.get(apiEndpoint, options);
};

export const patchAxiosApiWithToken = async(accessToken, apiEndpoint, parameters) => {

    const body = {
        ...parameters
    };
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    };
    return axios.patch(apiEndpoint, body, options);
};

export const postAxiosApiWithToken = async(accessToken, apiEndpoint, parameters) => {

    const body = {
        ...parameters
    };
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
    };
    console.log(body);
    return axios.post(apiEndpoint, body, options);
};
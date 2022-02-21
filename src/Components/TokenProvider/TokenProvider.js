import { useAccount, useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Text } from "@chakra-ui/react";
import { cloneElement, useEffect, useState } from "react";
import { protectedResources } from "../../authConfig";

const TokenProvider = (props) => {

    const isAuthenticated = useIsAuthenticated();

    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {})
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none") {
            instance.acquireTokenSilent({
                scopes: protectedResources.forecast.scopes,
                account: account
            }).then((response) => {
                setToken(response.accessToken);
            })
        }
    }, [account, inProgress, instance]);

    return(
        (!isAuthenticated || (token && account)) ? cloneElement(props.children, {accessToken: token, userId: account?.localAccountId}) : <Text>Loading...</Text>
    );
};

export default TokenProvider;
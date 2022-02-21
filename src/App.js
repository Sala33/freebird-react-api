import React, { createContext, Fragment, useEffect, useState } from 'react';
import {
  ChakraProvider,
} from '@chakra-ui/react';
import customTheme from './themes'
import MainPage from './Components/Content/MainPage';
import {
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import Job from './Components/Content/JobPage'
import UserProfile from './Components/UserProfile'
import Layout from './Components/Layout';
import PageList from './Components/Content/PageList/PageList';
import NewsPage from './Components/Content/NewsPage/NewsPage';
import BlogPost from './Components/Content/BlogPost';
import TaskOffice from './Components/Content/TaskOffice';
import { MsalProvider } from '@azure/msal-react';
import { queryClient } from './api/react-query/queryClient';
import { QueryClientProvider } from 'react-query';
import {ReactQueryDevtools } from 'react-query/devtools';
import Loading from './Components/Loading';
import WritePost from './Components/Content/WritePost';
import ProdutorasPage from './Components/Content/ProdutorasPage';
import ProjetoPage from './Components/Content/ProjetoPage';
import ProdutoraPage from './Components/Content/ProdutoraPage';
import ArtistPage from './Components/Content/ArtistPage';
import TramposPage from './Components/Content/TramposPage';
import ProjetoDescPage from './Components/Content/ProjetoDescPage';
import ArtistList from './Components/Content/ArtistListPage';
import OportunitiesPage from './Components/Content/OportunitiesPage';
import ProdutosPage from './Components/Content/ProdutosPage';
import IdentityContext from './Context/IdentityContext';
import './main.css'
import TrampoPage from './Components/Content/TrampoPage';
import OportunitiesList from './Components/Content/OportunitiesList';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './utils/firebase';
import { useUserData } from './hooks/useUserData';

const IDENTITY_VALUE = {
  userData: {
    profilePic: null,
    uid: null,
    userName: null
  },
  setUserData: () => {},
};

function Redirect() {

  useEffect(() => {
    window.location.href = "https://freebird.sala33.com.br/";
  }, []);

  return (
    <></>
  );
}


function RequireAuth(props) {
  const [user, loading, error] = useAuthState(auth);
  let location = useLocation();
  const [uid, setUid] = useState();
  const { data: userData, isLoading } = useUserData(uid);

  useEffect(
    () => {
      if(user){
        setUid(user.uid);
      }
    },[user]
  );

  if (!loading && !user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  if (!loading && user) {
    if(!isLoading && userData && userData?.userType !== props.usertype){
      return <Navigate to="/" state={{ from: location }} />;
    }
  }

  return  <Outlet />;
}

function App({ instance }) {
  const [userDataContext, setUserDataContext] = useState(IDENTITY_VALUE.userData);

  return (
      <ChakraProvider theme={customTheme}>
          <IdentityContext.Provider value={[userDataContext, setUserDataContext]}>
            <QueryClientProvider client={queryClient}>
              <Loading />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<MainPage />} />

                  <Route element={<RequireAuth usertype={'artista'} />}>
                    <Route path="artistas/editar-perfil" element={<ArtistPage />} />
                    <Route path="artistas/artista/escritorio" element={<ArtistPage />} />
                  </Route>
                  
                  <Route element={<RequireAuth usertype={'produtora'} />}>
                    <Route path="produtoras/editar-produtora" element={<ProdutoraPage />} />
                    <Route path="oportunidades/criar-oportunidade" element={<OportunitiesPage editPage />} />
                  </Route>

                  <Route path="artistas" element={<ArtistList />} />
                  <Route path="artistas/:artista" element={<ArtistPage />} />

                  <Route path="trampos" element={<TramposPage />} />
                  <Route path="trampos/:trampo" element={<TrampoPage />} />

                  <Route path="oportunidades/" element={<OportunitiesList />} />
                  <Route path="oportunidades/:oportunidade" element={<OportunitiesPage />} />

                  <Route path="produtoras" element={<ProdutorasPage />} />
                  <Route path="produtoras/:prod" element={<ProdutoraPage />} />

                  <Route path="projetos" element={<ProjetoPage />} />
                  <Route path="projetos/:projeto" element={<ProjetoDescPage />} />

                  <Route path="*" element={<MainPage />} />
                </Route>
              </Routes>
              <ReactQueryDevtools />
            </QueryClientProvider>
          </IdentityContext.Provider>
      </ChakraProvider>
  );
}

export default App;

import { Search2Icon } from "@chakra-ui/icons";
import { Box, Button, Center, Flex, Grid, GridItem, Heading, Input, InputGroup, InputLeftAddon, InputRightAddon, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { useTramposData } from "../../../hooks/useTramposData";
import { categorias } from "../../../utils/categorias";
import NewGigCard from "../../NewGigCard/NewGigCard";
import { TrampoCard } from "../../SliderCarousel/SliderCarousel";
import OportunidadeCard from "../OportunidadeCard";
import Select from 'react-select';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../utils/firebase";
import { useUserData, useUsersData } from "../../../hooks/useUserData";
import { Navigate, useNavigate } from "react-router-dom";
import IdentityContext from "../../../Context/IdentityContext";
import { similarity } from "../../../utils/leveshtein-distance";

const artistGigs = [
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
    {
      name: 'Nome do Artista',
      title: 'Título do Trampo',
      rating: 5,
      link: 'id',
      commentNum: 20,
      url: 'oportunidade'
    },
  ];

  const customStyles = {
    menu: (provided, state) => ({
        ...provided,
        width: 400,
      }),
    control: (provided) => ({
        ...provided,
    // none of react-select's styles are passed to <Control />
    width: 400,
    }),
    option: (provided, state) => ({
    ...provided,
    width: 400,
    }),
  }


const TramposPage = (props) => {
  const [name, setName] = useState('Dan');

  const {data, isLoading} = useTramposData();

  const [uid, setUid] = useState();
  const [user, loading, error] = useAuthState(auth);

  // const [userDataContext, setUserDataContext] = useContext(IdentityContext);

  const {data: usersData, isLoading: userLoading} = useUsersData();
  const [usersList, setUsersList] = useState([]);

  useEffect(
    () => {
      if(!userLoading && usersData){
        const userList = [];
        usersData.forEach(
          ele => {
            if(ele.userType && ele.userType === 'artista'){
              const p = {
                value: ele.uid,
                label: ele.name
              }
              userList.push(p);
            }
        });
        setUsersList(userList);
      }
    },[usersData, userLoading]
  );

  const { data: userDataQuery } = useUserData(uid);

  useEffect(
    () => {
      if(user){
        setUid(user.uid);
      }
    },[user]
  );

  const [ displayProjects, setDisplayProjects ] = useState([]);
  
  useEffect(() => {
    if(data){
      setDisplayProjects(Object.values(data));
      console.log(data);
    }
  }, [data])

  const navigate = useNavigate();
  
  function filterName(val){
      // const cp = [...data];
      // const d = cp.sort((a, b) => compare(a.name, b.name, val.toLowerCase()));
      // setDisplayData(d);
      setName(val);
  }

  const [artistasFilter, setArtistasFilter] = useState([]);
  const [habilidadeFilter, setHabilidadeFilter] = useState();
  const [modeloFilter, setModeloFilter] = useState();
  const [pagamentoFilter, setPagamentoFilter] = useState();

  function filterHabilidade(value){
    setHabilidadeFilter(value);
  }

  function filterModelo(value){
    setModeloFilter(value);
  }

  function filterPagamento(value){
    setPagamentoFilter(value);
  }

  useEffect(
    () => {
      filterAll();
    },[artistasFilter, habilidadeFilter, modeloFilter, pagamentoFilter, pagamentoFilter]
  );

  function artistasFilterFn(value){
    if(artistasFilter.length === 0) { return true; }
    return artistasFilter.some(item => value?.owner === item.value);
  }

  function habilidadeFilterFn(value){
    if(!habilidadeFilter) { return true; }
    if(value.habilidades && value.habilidades.trim() !== ''){
      return (similarity(value.habilidades, habilidadeFilter) > 0.1);
    }
    return false;
  }

  function modeloFilterFn(value){
    if(!modeloFilter) { return true; }
    if(value.modelo && value.modelo.trim() !== ''){
      return (similarity(value.modelo, modeloFilter) > 0.1);
    }
    return false;
  }

  function pagamentoFilterFn(value){
    if(!pagamentoFilter) { return true; }
    if(value.pagamento && value.pagamento.trim() !== ''){
      return (similarity(value.pagamento, pagamentoFilter) > 0.1);
    }
    return false;
  }

  function filterArtists(value){
    const d = [];
    value.forEach(element => {
        d.push(element);
    });
    setArtistasFilter(d);
  }

  const filters = [artistasFilterFn, habilidadeFilterFn, modeloFilterFn, pagamentoFilterFn];

  function filterAll(){
    if(!data) { return; }
    const filteredData = filters.reduce((d, f) => d.filter(f) , Object.values(data));
    setDisplayProjects(filteredData);
  }


  return(
    <>
      <Box bgColor={'#f05d34'} w={'full'} px={'120px'}>
        <Box bgImage={'https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Ftrampos.jpg?alt=media&token=3e0ce6f8-dd61-44ac-8d1e-a4586905fb1e'}
              height={'402px'} width={'full'} bgSize={'cover'} bgRepeat={'no-repeat'} bgPosition={'center'}
              bgColor={'#f05d34'}
            justifyContent={'center'} alignItems={'center'} />
      </Box>
      <Grid
      minH='200px'
      templateRows='repeat(1, 1fr)'
      templateColumns='repeat(3, 1fr)'
      gap={4}
      py={'71px'}
      px={'100px'}
      >
          <GridItem  colSpan={1}>
            <VStack align={'start'} w={'full'} py={'20px'} px={'10px'} spacing={'20px'} bgColor='#00A19521'>
                {usersList.length > 0?
                  <>
                      <Heading fontSize={'16px'} fontWeight={'bold'}>Artistas</Heading>
                      <Center w={'full'}>
                          <Select
                              isMulti
                              styles={customStyles}
                              onChange={(newValue, actionMeta) => filterArtists(newValue)}
                              name="colors"
                              options={usersList}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              placeholder={'Selectione um Artista'}
                          />
                      </Center>
                  </>
                : null}
                <Heading fontSize={'16px'} fontWeight={'bold'}>Habilidades</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Busque por uma Habilidade' onChange={(e) => filterHabilidade(e.target.value)}/>
                </Center>
                <Heading fontSize={'16px'} fontWeight={'bold'}>Modelo de Contratação</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Busque por um modelo de contratação' onChange={(e) => filterModelo(e.target.value)}/>
                </Center>
                <Heading fontSize={'16px'} fontWeight={'bold'}>Modelo de Pagamento</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Busque por uma forma de pagamento' onChange={(e) => filterPagamento(e.target.value)}/>
                </Center>
                {/* <Heading fontSize={'16px'} fontWeight={'bold'}>Habilidades</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Busque por uma Habilidade' onChange={(e) => filterHabilidade(e.target.value)}/>
                </Center>
                <Heading fontSize={'16px'} fontWeight={'bold'}>Idiomas</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Busque por uma Idioma' onChange={(e) => filterIdioma(e.target.value)}/>
                </Center>
                <Heading fontSize={'16px'} fontWeight={'bold'}>Contratação</Heading>
                <Center w={'full'}>
                  <Input variant={'filled'} placeholder='Pessoa Jurídica ou Física' onChange={(e) => filterContratacao(e.target.value)}/>
                </Center> */}
            </VStack>
          </GridItem>
          <GridItem  colSpan={2}>
          <VStack spacing={'16px'}>
              <VStack width={'full'} align={'start'}>
                    <Heading fontSize={'30px'} fontWeight={700}>Veja os Trampos</Heading>
                    <Text fontWeight={300} fontSize={'16px'}>Filtre os trabalhos disponíveis de acordo com as necessidades de seu projeto!</Text>
                </VStack>
                <VStack w={'full'}>
                  <Flex px={'36px'} py={'20px'} justifyContent={'space-between'} bgColor={'rgba(0, 161, 149, 0.13)'} width={'full'} height={'full'}>
                    <Box w={'70%'}>
                      <InputGroup size={'lg'} >
                          <InputLeftAddon children='Buscar' />
                          <Input variant={'filled'} placeholder='Busca por Nome' onChange={(e) => filterName(e.target.value)}/>
                          <InputRightAddon children={<Search2Icon />} />
                      </InputGroup>
                    </Box>
                    {
                      userDataQuery?.userType === 'artista'?
                        <Button width={'150px'} height={'50px'} onClick={() => navigate('/trampos/criar-trampo')} rounded={0} bgColor={'#F05D34'}>Novo Trampo</Button>
                      : null
                    }
                  </Flex>
                </VStack>
                  <VStack bgColor={'#FDD07A21'} p={'20px'} height={'full'} width={'full'}>
                      <Wrap width={'full'} spacing={'50px'}>
                          {!isLoading?
                              [...displayProjects].filter(e => e.url?.trim() !== '').map(
                                  (item, index) => {
                                      return(
                                          <WrapItem key={index}>
                                              <TrampoCard key={index} item={item} />
                                          </WrapItem>
                                      );
                                  }
                              )
                              : null
                          }
                      </Wrap>
                  </VStack>
              </VStack>
          </GridItem>
      </Grid>
    </>
  );
};

export default TramposPage;

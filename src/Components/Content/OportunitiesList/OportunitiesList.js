import { Search2Icon } from "@chakra-ui/icons";
import { Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Input, InputGroup, InputLeftAddon, InputRightAddon, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useTramposData } from "../../../hooks/useTramposData";
import { categorias } from "../../../utils/categorias";
import NewGigCard from "../../NewGigCard/NewGigCard";
import { TrampoCard } from "../../SliderCarousel/SliderCarousel";
import OportunidadeCard from "../OportunidadeCard";
import Select from 'react-select';
import { useOportunidadesData } from "../../../hooks/useOportunidadesData";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserData } from "../../../hooks/useUserData";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../utils/firebase";
import { similarity } from "../../../utils/leveshtein-distance";
import { useProdutorasData } from "../../../hooks/useProdutorasData";

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


const OportunitiesList = (props) => {
  const [name, setName] = useState('Dan');
  const [searchParams, setSearchParams] = useSearchParams();

  const [ displayProjects, setDisplayProjects ] = useState([]);
  

  const {data, isLoading} = useOportunidadesData();
  const {data: produtorasData, isLoading: isLoadingProdutorasData} = useProdutorasData();

  const [uid, setUid] = useState();
  const [user, loading, error] = useAuthState(auth);

  const { data: userDataQuery } = useUserData(uid);

  useEffect(
    () => {
      if(user){
        setUid(user.uid);
      }
    },[user]
  );

  useEffect(() => {
    if(data){
      console.log(data);
      const searchOwner = searchParams.get("owner");
      let d = Object.values(data);
      if(searchOwner){
        d = d.filter(o => o.owner === searchOwner);
      }
      setDisplayProjects(d);
      getProjetos();
    }
  }, [data])

  useEffect(
    () => {
      if(produtorasData){
        getProdutoras();
      }
    },[produtorasData]
  );

  const navigate = useNavigate();

  function compare(a, b, val){
    if (similarity(a, val) < similarity(b, val)) {
        return -1;
    };
    if (similarity(a, val) > similarity(b, val)) {
        return 1;
    };
    // a must be equal to b
    return 0;
  }
  
  function filterName(val){
      // const cp = [...data];
      // const d = cp.sort((a, b) => compare(a.name, b.name, val.toLowerCase()));
      // setDisplayData(d);
      setName(val);
  }

  const [projetosList, setProjetosList] = useState([]);
  const [produtorasList, setProdutorasList] = useState([]);

  function getProjetos(){
    let projetosList = [];
    Object.values(data).forEach(
        ele => {
            if(ele.ownerProj?.name){
              projetosList.push(ele.ownerProj.name);
            }
        }
    );
    projetosList = [...new Set(projetosList)]
    const valueArray = [];
    projetosList.forEach(
        e => {
            const item = {value: e, label: e}
            valueArray.push(item);
        }
    );
    setProjetosList(valueArray);
  }

  function getProdutoras(){
    let produtorasList = [];
    Object.values(data).forEach(
        ele => {
            if(produtorasData[ele.owner]){
              produtorasList.push(produtorasData[ele.owner].name);
            }
        }
    );
    produtorasList = [...new Set(produtorasList)]
    const valueArray = [];
    produtorasList.forEach(
        e => {
            const item = {value: e, label: e}
            valueArray.push(item);
        }
    );
    setProdutorasList(produtorasList);
  }

  const [projetosFilter, setProjetosFilter] = useState([]);
  const [produtoraFilter, setProdutoraFilter] = useState([]);
  const [habilidadeFilter, setHabilidadeFilter] = useState();
  const [idiomaFilter, setIdiomaFilter] = useState();
  const [contratacaoFilter, setContratacoFilter] = useState();

  useEffect(
    () => {
      console.log(projetosFilter);
    },[projetosFilter]
  );

  useEffect(
    () => {
        filterAll();
    },[habilidadeFilter, idiomaFilter, contratacaoFilter, projetosFilter]
  );

  function filterProjetos(value){
    const d = [];
    value.forEach(element => {
        d.push(element.label);
    });
    setProjetosFilter(d);
  }

  function filterProdutora(value){
    const d = [];
    value.forEach(element => {
        d.push(element.label);
    });
    setProdutoraFilter(d);
  }

  function filterHabilidade(value){
    setHabilidadeFilter(value);
  }

  function filterIdioma(value){
    setIdiomaFilter(value);
  }

  function filterContratacao(value){
    setContratacoFilter(value);
  }

  function habilidadeFilterFn(value){
    if(!habilidadeFilter) { return true; }
    if(value.habilidades && value.habilidades.trim() !== ''){
      return (similarity(value.habilidades, habilidadeFilter) > 0.1);
    }
    return false;
  }

  function idiomaFilterFn(value){
    if(!idiomaFilter) { return true; }
    if(value.idioma && value.idioma.trim() !== ''){
      return (similarity(value.idioma, idiomaFilter) > 0.1);
    }
    return false;
  }

  function contratacaoFilterFn(value){
    if(!contratacaoFilter) { return true; }
    if(value.contratacao && value.contratacao.trim() !== ''){
      return (similarity(value.contratacao, contratacaoFilter) > 0.1);
    }
    return false;
  }

  function projetosFilterFn(value){
    if(projetosFilter.length === 0) { return true; }
    return projetosFilter.some(item => value.ownerProj?.name === item);
  }

  const filters = [habilidadeFilterFn, idiomaFilterFn, contratacaoFilterFn, projetosFilterFn]

  function filterAll(){
    if(!data) { return; }
    const filteredData = filters.reduce((d, f) => d.filter(f) , Object.values(data));
    setDisplayProjects(filteredData);
  }

  return(
    <>
      <Box bgImage={'https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/artistas%2Foportunidades.png?alt=media&token=7b7d938f-5ad9-416e-8ea2-3c433e5b82a2'}
            height={'402px'} width={'full'} bgSize={'contain'} bgRepeat={'no-repeat'} bgPosition={'center'}
            bgColor={'#f05d34'}
          justifyContent={'center'} alignItems={'center'}>
      </Box>
      <Grid
      minH='200px'
      templateRows='repeat(1, 1fr)'
      templateColumns='repeat(3, 1fr)'
      gap={4}
      py={'71px'}
      px={'100px'}
      w={'full'}
      >
          <GridItem colSpan={1} w='full'>
              <VStack align={'start'} w={'full'} py={'20px'} px={'10px'} spacing={'20px'} bgColor='#00A19521'>
                  <Heading fontSize={'16px'} fontWeight={'bold'}>Projeto</Heading>
                  <Center w={'full'}>
                      <Select
                          isMulti
                          styles={customStyles}
                          onChange={(newValue, actionMeta) => filterProjetos(newValue)}
                          name="colors"
                          options={projetosList}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder={'Selectione um Projeto'}
                      />
                  </Center>
                  {produtorasList.length > 0?
                    <>
                        <Heading fontSize={'16px'} fontWeight={'bold'}>Produtoras</Heading>
                        <Center w={'full'}>
                            <Select
                                isMulti
                                styles={customStyles}
                                onChange={(newValue, actionMeta) => filterProdutora(newValue)}
                                name="colors"
                                options={produtorasList}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder={'Selectione um Projeto'}
                            />
                        </Center>
                    </>
                  : null}
                  <Heading fontSize={'16px'} fontWeight={'bold'}>Habilidades</Heading>
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
                  </Center>
                  {/* <Heading fontSize={'16px'} fontWeight={'bold'}>Habilidades</Heading>
                  {habilidades?
                      <Center w={'full'}>
                          <Select
                          isMulti
                          styles={customStyles}
                          onChange={(newValue, actionMeta) => filterHabilidade(newValue)}
                          name="colors"
                          options={habilidades}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder={'Selectione uma Habilidade'}
                          />
                      </Center>
                      :null
                  }
                  {locationList.length > 0?
                      <>
                          <Heading fontSize={'16px'} fontWeight={'bold'}>Localização</Heading>
                          <Center w={'full'}>
                              <Select
                                  isMulti
                                  styles={customStyles}
                                  onChange={(newValue, actionMeta) => filterLocation(newValue)}
                                  name="colors"
                                  options={locationList}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  placeholder={'Selectione uma Localização'}
                              />
                          </Center>
                      </>
                  : null}
                  <Heading fontSize={'16px'} fontWeight={'bold'}>Software</Heading>
                      <Center w={'full'}>
                          <Select
                              isMulti
                              styles={customStyles}
                              onChange={(newValue, actionMeta) => filterSoftware(newValue)}
                              name="colors"
                              options={softwareList}
                              className="basic-multi-select"
                              classNamePrefix="select"
                              placeholder={'Selectione um Software'}
                          />
                      </Center>
                  <Heading fontSize={'16px'} fontWeight={'bold'}>Idiomas</Heading>
                  <Center w={'full'}>
                      <Select
                          isMulti
                          styles={customStyles}
                          onChange={(newValue, actionMeta) => filterIdioma(newValue)}
                          name="colors"
                          options={idiomasList}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder={'Selectione um Idioma'}
                      />
                  </Center> */}
                  {/* <Heading>Projetos Finalizados</Heading>
                  <Flex w={'full'} justifyContent={'space-around'}>
                      <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>Todos</Button>
                      <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>1 - 3</Button>
                      <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>+3</Button>
                  </Flex> */}
                  {/* <Heading fontSize={'16px'} fontWeight={'bold'}>Valor Diária</Heading>
                  <Center w={'full'}>
                      <HStack w={'70%'}>
                          <InputGroup size='sm' >
                              <InputLeftAddon children='R$' />
                              <Input type={'number'} placeholder={'Minimo'} variant={'filled'} onChange={(e) => setDailyValues(e.target.value, 'min')}/>
                          </InputGroup>
                          <InputGroup size='sm' >
                              <InputLeftAddon children='R$' />
                              <Input type={'number'} variant={'filled'} placeholder={'Maximo'} onChange={(e) => setDailyValues(e.target.value, 'max')}/>
                          </InputGroup>
                      </HStack>
                  </Center> */}
              </VStack>
          </GridItem>
          <GridItem  colSpan={2}>
          <VStack spacing={'16px'}>
              <VStack width={'full'} align={'start'}>
                    <Heading fontSize={'30px'} fontWeight={700}>Veja as oportunidades</Heading>
                    <Text fontWeight={300} fontSize={'16px'}>Filtre as oportunidades de acordo com suas habilidades!</Text>
                </VStack>
                <VStack w={'full'}>
                  <HStack px={'36px'} py={'20px'}  bgColor={'rgba(0, 161, 149, 0.13)'} width={'full'} height={'full'}>
                    <VStack width={'full'}>
                        <Center h={'full'}>
                          <Select
                              isMulti
                              styles={customStyles}
                              onChange={(newValue, actionMeta) => console.log(newValue)}
                              name="colors"
                              options={categorias}
                              className="basic-multi-select"
                              classNamePrefix="select"
                          />
                        </Center>
                    </VStack>
                    <Box w={'full'}>
                      <InputGroup size={'lg'} >
                          <InputLeftAddon children='Buscar' />
                          <Input variant={'filled'} placeholder='Busca por Nome' onChange={(e) => filterName(e.target.value)}/>
                          <InputRightAddon children={<Search2Icon />} />
                      </InputGroup>
                    </Box>
                    {
                      userDataQuery?.userType === 'produtora'?
                        <Button width={'150px'} height={'50px'} onClick={() => navigate('/oportunidades/criar-oportunidade')} rounded={0} bgColor={'#F05D34'}>Nova Oportunidade</Button>
                      : null
                    }
                  </HStack>
                </VStack>
                  <VStack bgColor={'#FDD07A21'} p={'20px'} height={'full'} width={'full'}>
                      <Wrap width={'full'} spacing={'50px'}>
                          {!isLoading?
                              [...displayProjects].sort((a, b) => compare(b.Title.toLowerCase(), a.Title.toLowerCase(), name.toLowerCase())).map(
                                  (item, index) => {
                                      return(
                                          <WrapItem key={index}>
                                              <OportunidadeCard key={index} item={item} />
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

export default OportunitiesList;

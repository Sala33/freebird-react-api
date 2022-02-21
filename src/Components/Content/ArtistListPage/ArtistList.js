import { Avatar, Badge, Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Image, Input, InputGroup, InputLeftAddon, InputRightAddon, Link, Skeleton, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import fallback from './Images/Fallback.png'
import { Link as ReachLink, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { categorias } from "../../../utils/categorias";
import { Search2Icon } from "@chakra-ui/icons";
import { useUsersData } from "../../../hooks/useUserData";
import { useEffect, useState } from "react";
import { useProdutorasData } from "../../../hooks/useProdutorasData";
import { useTramposData } from "../../../hooks/useTramposData";
import { useOportunidadesData } from "../../../hooks/useOportunidadesData";
import { useProjectsDataObject } from "../../../hooks/useProjectsData";
import { similarity } from "../../../utils/leveshtein-distance";

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

const artists = [
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
    {
        name: 'Ian Gigliotti',
        url: 'artista'
    },
];

const ArtistaCard = (props) => {
    const navigate = useNavigate();

    function nav(){
        const url = props.url || props.uid;
        navigate(`/artistas/${url}`);
    }

    return(
        <Box width={'full'}>
            <HStack>
                <Box w={'2px'} h={'500px'} bgColor={'#5853A2'} />
                <VStack w={'70%'} px={'25px'} spacing={'20px'}>
                    <HStack w={'full'} spacing={'35px'}>
                        <Avatar src={props?.profilePic} height={'186px'} w={'186px'} />
                        <VStack align={'start'} spacing={'42px'}>
                            <VStack spacing={'13px'} align={'start'}>
                                <Heading fontSize={'24px'} fontWeight={'700px'}>{props.name}</Heading>
                                <Text fontSize={'16px'}>{props.title}</Text>
                                <Avatar src={props?.produtora?.profilePic} size={'sm'} />
                            </VStack>
                            <Button onClick={nav} h={'50px'} w={'140px'} rounded={0} bgColor={'#00A195'}>Conheça mais</Button>
                        </VStack>
                    </HStack>
                    <Text fontSize={'14px'} fontWeight={'400px'}>{props.miniBio}</Text>
                    <VStack px={'30px'} w={'full'} align={'start'}>
                        <Wrap>
                            {props.habilidades?.map(
                                (item, index) => {
                                    return(
                                        <WrapItem key={index}>
                                            <Badge py={'3px'} px={'10px'} size={'sm'} color={'white'} rounded={60} bgColor={'#7975B5'}>{item.name}</Badge>
                                        </WrapItem>
                                    );
                                }
                            )}
                        </Wrap>
                        <Wrap>
                            {props.softwares?.map(
                                (item, index) => {
                                    return(
                                        <WrapItem key={index}>
                                            <Badge py={'3px'} px={'10px'} size={'sm'} color={'white'} rounded={60} bgColor={'#FCB022'}>{item.name}</Badge>
                                        </WrapItem>
                                    );
                                }
                            )}
                        </Wrap>
                        <HStack>
                            {props.idiomas?.map(
                                (item, index) => {
                                    return(
                                        <WrapItem key={index}>
                                            <Badge py={'3px'} px={'10px'} size={'sm'} color={'white'} rounded={60} bgColor={'#F37D5D'}>{item.name}</Badge>
                                        </WrapItem>
                                    );
                                }
                            )}
                        </HStack>
                    </VStack>
                </VStack>
                <VStack align={'start'} h={'full'} spacing={'30px'}>
                        <Box>
                            <Heading fontSize={'14px'} fontWeight={'700'}>Trampos Cadastrados</Heading>
                            <Heading fontSize={'20px'} fontWeight={'700'}>{props.tramposNum}</Heading>
                        </Box>
                        <Box>
                            <Heading fontSize={'14px'} fontWeight={'700'}>Oportunidades Cadastradss</Heading>
                            <Heading fontSize={'20px'} fontWeight={'700'}>{props.opCount}</Heading>
                        </Box>
                        <Box>
                            <Heading fontSize={'14px'} fontWeight={'700'}>Projetos Cadastrados</Heading>
                            <Heading fontSize={'20px'} fontWeight={'700'}>{props.projNum}</Heading>
                        </Box>
                        <Box>
                            <Heading fontSize={'14px'} fontWeight={'700'}>Valor médio hora</Heading>
                            <Heading fontSize={'18px'} color={'#00A195'} fontWeight={'700'}>{props.horaPreco}</Heading>
                        </Box>
                </VStack>
            </HStack>
        </Box>
    );
};

const ArtistList = (props) => {
    const {data, isLoading} = useUsersData();
    const { data: produtoras, isLoading: produtorasLoad } = useProdutorasData();
    const { data: trampos, isLoading: tramposLoad } = useTramposData();
    const { data: oportunidades, isLoading: oportunidadesLoad } = useOportunidadesData();
    const { data: projetos, isLoading: projetosLoad } = useProjectsDataObject();

    const [habilidades, setHabilidades] =  useState(null);
    const [displayData, setDisplayData] =  useState([]);
    const [atividadeList, setAtividadeList] = useState([]);
    const [locationList, setLocationList] = useState([]);
    const [idiomasList, setIdiomasList] = useState([]);
    const [softwareList, setSoftwareList] = useState([]);

    useEffect(
        () => {
            if(data){
                console.log(data);
                const cp = [...data]
                setDisplayData(cp.filter(e => e.miniBio));
                getHabilidades();
                getAtividades();
                getLocalizacao();
                getIdiomas();
                getSoftware();
            }
        }, [data]
    );

    function getHabilidades(){
        let habilidadeList = [];
        data.forEach(
            ele => {
                ele.habilidades?.forEach(
                    e => {
                        if(e.name)
                        {
                            habilidadeList.push(e.name);
                        }
                    }
                )
            }
        );
        habilidadeList = [...new Set(habilidadeList)]
        const valueArray = [];
        habilidadeList.forEach(
            e => {
                const item = {value: e, label: e}
                valueArray.push(item);
            }
        );
        setHabilidades(valueArray);
    }

    function getAtividades(){
        let atividadeList = [];
        data.forEach(
            ele => {
                ele.segmentos?.forEach(
                    e => {
                        if(e){
                            atividadeList.push(e);
                        }
                    }
                )
            }
        );
        atividadeList = [...new Set(atividadeList)]
        const valueArray = [];
        atividadeList.forEach(
            e => {
                const item = {value: e, label: e}
                valueArray.push(item);
            }
        );
        setAtividadeList(valueArray.filter(e => e.value.trim() !== ''));
    }

    function getLocalizacao(){
        let localList = [];
        data.forEach(
            ele => {
                if(ele.local)
                    localList.push(ele.local);
            }
        );
        localList = [...new Set(localList)]
        const valueArray = [];
        localList.forEach(
            e => {
                const item = {value: e, label: e}
                valueArray.push(item);
            }
        );
        setLocationList(valueArray);
    }

    function getIdiomas(){
        let idiList = [];
        data.forEach(
            ele => {
                ele.idiomas?.forEach(
                    e => {
                        if(e.name){
                            idiList.push(e.name);
                        }
                    }
                )
            }
        );
        idiList = [...new Set(idiList)]
        const valueArray = [];
        idiList.forEach(
            e => {
                const item = {value: e, label: e}
                valueArray.push(item);
            }
        );
        setIdiomasList(valueArray);
    }

    function getSoftware(){
        let softList = [];
        data.forEach(
            ele => {
                ele.softwares?.forEach(
                    e => {
                        if(e.name){
                            softList.push(e.name);
                        }
                    }
                )
            }
        );
        softList = [...new Set(softList)]
        const valueArray = [];
        softList.forEach(
            e => {
                const item = {value: e, label: e}
                valueArray.push(item);
            }
        );
        setSoftwareList(valueArray);
    }

    function getProdutora(uid){
        try{
            const produtora = produtoras[uid];
            if(!produtora) {return null;}
            return produtora;
        } catch {
            return null;
        }
    }

    function getTrampoCount(uid){
        return Object.values(trampos).filter(e => e.owner === uid).length;
    }
    function getOportunidadeCount(uid){
        return Object.values(oportunidades).filter(e => e.owner === uid).length;
    }
    function getProjCount(uid){
        return Object.values(projetos).filter(e => e.owner === uid).length;
    }


    const [atividades, setAtividades] = useState([]);
    const [habilidadesFilter, setHabilidadesFilter] = useState([]);
    const [location, setLocation] = useState([]);
    const [software, setSoftware] = useState([]);
    const [idiomaFilter, setIdiomaFilter] = useState([]);
    const [daily, setDaily] = useState({'min': 0, 'max': 0});

    useEffect(
        () => {
            if(atividades || habilidadesFilter || location || software || idiomaFilter || daily){
                filterAll();
            }
        },[atividades, habilidadesFilter, location, software, idiomaFilter, daily]
    );

    const filters = [atividadeFilter, habilidadesFilterFn, locationFilter, softwareFilterFn, idiomaFilterFn, dailyValueFilter]

    function dailyValueFilter(value){
        if(!daily['min'] && !daily['max']) { return true; }
        return value.horaPreco >= daily['min'] && value.horaPreco <= daily['max'];
    }
    function atividadeFilter(value){
        if(atividades.length === 0) { return true; }
        return atividades.some(item => value?.segmentos?.includes(item));
    }

    function habilidadesFilterFn(value){
        if(habilidadesFilter.length === 0) { return true; }
        return habilidadesFilter.some(item => value?.habilidades?.some(e => e.name === item));
    }

    function idiomaFilterFn(value){
        if(idiomaFilter.length === 0) { return true; }
        return idiomaFilter.some(item => value?.idiomas?.some(e => e.name === item));
    }

    function softwareFilterFn(value){
        if(software.length === 0) { return true; }
        return software.some(item => value?.softwares?.some(e => e.name === item));
    }

    function locationFilter(value){
        if(location.length === 0) { return true; }
        return location.some(item => value?.local === item);
    }

    function filterAtividade(value){
        const d = [];
        value.forEach(element => {
            d.push(element.label);
        });
        setAtividades(d);
    }

    function filterHabilidade(value){
        const d = [];
        value.forEach(element => {
            d.push(element.label);
        });
        setHabilidadesFilter(d);
    }

    function filterLocation(value){
        const d = [];
        value.forEach(element => {
            d.push(element.label);
        });
        setLocation(d);
    }

    function filterSoftware(value){
        const d = [];
        value.forEach(element => {
            d.push(element.label);
        });
        setSoftware(d);
    }

    function filterIdioma(value){
        const d = [];
        value.forEach(element => {
            d.push(element.label);
        });
        setIdiomaFilter(d);
    }

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

    const [name, setName] = useState('Dan');

    function filterName(val){
        // const cp = [...data];
        // const d = cp.sort((a, b) => compare(a.name, b.name, val.toLowerCase()));
        // setDisplayData(d);
        setName(val);
    }

    function setDailyValues(value, type){
        if(!value){
            value = 0;
        }
        const cp = {...daily}
        cp[type] = Number(value);
        setDaily(cp);
    }

    function filterAll(){
        if(!data) { return; }
        const filteredData = filters.reduce((d, f) => d.filter(f) , data);

        setDisplayData(filteredData);
    }

    return(
        <VStack width={'full'}  px={{base:0, md:'100px'}} py={'28px'} spacing={'28px'}>
            <Box bgImage={'https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/artistas%2FArtistas-Logo.png?alt=media&token=97467202-c78b-4e5d-9e80-6728050aac04'}
             height={'402px'} width={'full'} bgSize={'contain'} bgRepeat={'no-repeat'} bgPosition={'center'}
             bgColor={'#f05d34'}
            justifyContent={'center'} alignItems={'center'}>
            </Box>
            <Grid templateColumns='repeat(3, 1fr)' gap={6} w={'full'}>
                <GridItem colSpan={1} w='100%'>
                    <VStack align={'start'} w={'full'} py={'20px'} px={'10px'} spacing={'20px'} bgColor='#00A19521'>
                        <Heading fontSize={'16px'} fontWeight={'bold'}>Atividade freelancer</Heading>
                        <Center w={'full'}>
                            <Select
                                isMulti
                                styles={customStyles}
                                onChange={(newValue, actionMeta) => filterAtividade(newValue)}
                                name="colors"
                                options={atividadeList}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder={'Selectione uma Atividade'}
                            />
                        </Center>
                        <Heading fontSize={'16px'} fontWeight={'bold'}>Habilidades</Heading>
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
                        </Center>
                        {/* <Heading>Projetos Finalizados</Heading>
                        <Flex w={'full'} justifyContent={'space-around'}>
                            <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>Todos</Button>
                            <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>1 - 3</Button>
                            <Button color={'black'} bgColor={'white'} rounded={0} variant={'outline'} w={'80px'} h={'40px'}>+3</Button>
                        </Flex> */}
                        <Heading fontSize={'16px'} fontWeight={'bold'}>Valor Diária</Heading>
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
                        </Center>
                    </VStack>
                </GridItem>
                <GridItem colSpan={2} w='100%'>
                    <VStack>
                        <InputGroup size={'lg'} >
                            <InputLeftAddon children='Buscar' />
                            <Input variant={'filled'} placeholder='Busca por Nome' onChange={(e) => filterName(e.target.value)}/>
                            <InputRightAddon children={<Search2Icon />} />
                        </InputGroup>
                        <VStack spacing={'40px'}>
                            {!isLoading && !produtorasLoad && !tramposLoad && !oportunidadesLoad && !projetosLoad?
                                [...displayData].sort((a, b) => compare(b.name.toLowerCase(), a.name.toLowerCase(), name.toLowerCase())).map(
                                    (item, index) => {
                                        return(
                                            <ArtistaCard key={index} {...item} 
                                                produtora={getProdutora(item.uid)} 
                                                tramposNum={getTrampoCount(item.uid)}
                                                projNum={getProjCount(item.uid)}
                                                opCount={getOportunidadeCount(item.uid)} />
                                        );
                                    }
                                )
                                : null
                            }
                        </VStack>
                    </VStack>
                </GridItem>
            </Grid>
        </VStack>
    );
};

export default ArtistList;

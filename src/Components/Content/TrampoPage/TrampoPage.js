import { AspectRatio, Avatar, Badge, Box, Button, Center, Checkbox, FormControl, FormErrorMessage, Grid, GridItem, Heading, HStack, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, Skeleton, SkeletonCircle, SkeletonText, Spacer, Stack, Text, Tooltip, VStack } from "@chakra-ui/react"
import { Circle, GoogleMap, LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import MDEditor from "@uiw/react-md-editor";
import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { Carousel } from "react-responsive-carousel";
import { useNavigate, useParams } from "react-router-dom";
import rehypeSanitize from "rehype-sanitize";
import { auth, db, storage } from "../../../utils/firebase";
import { SkillBar } from 'react-skills';
import SliderCarousel from "../../SliderCarousel";
import { EditIcon, PhoneIcon } from "@chakra-ui/icons";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { nanoid } from "nanoid";
import { useUserData } from "../../../hooks/useUserData";
import * as Yup from 'yup';
import ReactInputMask from "react-input-mask";
import { useProdutorasData } from "../../../hooks/useProdutorasData";
import { useProjectsData } from "../../../hooks/useProjectsData";
import { Swiper, SwiperSlide } from "swiper/react";

const SignupSchema = Yup.object().shape({
    categoria: Yup.string().max(100, 'Nome muito Longo').required('Categoria é obrigatória'),
    details: Yup.string().required('Data Obrigatória!'),
    habilidades: Yup.string().required('Habilidades necessárias para o trabalho'),
    livre: Yup.bool().required('Aponte um estado'),
    location: Yup.object().shape({lat: Yup.number(), lng: Yup.number()}),
    media: Yup.array(Yup.string().url('Deve ser um link válido de Youtube, Twitch ou Soundcloud').required('Adicione até 4 links de media.'))
            .max(4, 'Mais de quatro links encontrados')
            .notRequired('Ao menos uma imagem deve ser fornecida'),
    orçamento: Yup.string().required('Orçamento do trabalho!'),  
    pagamento: Yup.string().required('Forma de pagamento!'),  
    title: Yup.string().max(250, 'Título muito longo').required('Coloque um Título no Trabalho'),
    modelo: Yup.string().max(250, 'Modelo é muito longo').required('Especifique um modelo de Trabalho'),
    url: Yup.string().required('A url é obrigatória na criação'),
    local: Yup.string().max(250, 'Título muito longo'),
    contato: Yup.string().required('É necessário um meio de contato'), 
});

const initialData = {
    categoria: '',
    details: '',
    habilidades: '',
    livre: false,
    location: {lat: -16.6868912, lng: -49.2647943},
    media: [],
    modelo: '',
    orçamento: '',
    owner: '',
    pagamento: '',
    pic: '',
    title: '',
    url: '',
    local: '',
    contato: ''
}

const circleOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.6,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 100,
    zIndex: 1
  }

const libraries = ["places"];

function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)\??/.test(url);
  };

const YoutubeSlide = ({ url, isSelected }) => (
    <ReactPlayer width="100%" height="600px" url={url} playing={false} />
);

const CarouselVideo = ({ data }) => {

    const customRenderItem = (item, props) => (
      <item.type {...item.props} {...props} />
    );

    return (
        <Carousel
         autoPlay={false}
         emulateTouch={true}
         showArrows={true}
         showThumbs={false}
         showStatus={false}
         infiniteLoop={true}
         renderItem={customRenderItem}
       >
        {data?.map((v, index) => {   
            // console.log(v);
            // console.log(isImage(v));
            if(isImage(v)){
                return(
                    <AspectRatio ratio={16/9}>
                        <Image src={v} />
                    </AspectRatio>
                );
            }
            else {
                return(
                    <YoutubeSlide
                    url={v}
                    muted
                    playing={false}
                    key={index}
                  />
                );
            }
        })}
       </Carousel>
    );
   };

const ProjetoCard = ({item}) => {
    const navigate = useNavigate();
    console.log(item);
    return(
        <Box w={'350px'} minH={'350px'} bg={'white'}>
            <Box bgSize={'cover'} bgPosition={'center'} w={'350px'} h={'200px'}
                bgImage={item.preview} />
            <VStack w={'full'} spacing={'25px'} p={'25px'}>                                                      
                <Center width={'full'}>
                    <Heading fontWeight={'bold'} fontSize={'16px'}>{item.name}</Heading>
                </Center>
                <Button disabled={!item.url} onClick={() => navigate(`/projetos/${item.url}`)} h={'50px'} w={'150px'} rounded={0} bgColor={'#00A195'}>
                        Conheça
                </Button>
            </VStack>                                                      
        </Box>
    );
};

const ProjetoCarousel = (props) => 
{
    const { projetos } = props;

    return (
        projetos.length > 0? 
            <Box w={'full'} px={'10px'} display={'block'}>
                    <Swiper
                        spaceBetween={350}
                        slidesPerView={3}
                        // onSlideChange={() => console.log('slide change')}
                        // onSwiper={(swiper) => console.log(swiper)}
                        >
                        {projetos.filter(e => e.url).map(
                            (item, index) => (
                                <Box w={'350px'}>
                                    <SwiperSlide  key={index}>
                                            <ProjetoCard item={item} />
                                    </SwiperSlide>
                                </Box>
                        ))
                        }                        
                    </Swiper>
          </Box>
         : null
      ); 
}

const TrampoPage = (props) => 
{ 
    const { trampo } =useParams();

    const [current, setCurrent] = useState(null);
    const [ownerID, setOwnerID] = useState(null);
    const [userOwner, setUserOwner] = useState(null);
    const [trampos, setTrampos] = useState(null);
    const [user] = useAuthState(auth);

    const [uid, setUid] = useState();
    const { data: userData } = useUserData(uid);

    useEffect(
        () => {
          if(user){
            setUid(user.uid);
          }
        },[user]
      );


    async function getTrampos(){
        const querySnapshot = await getDocs(collection(db, "trampos"));
        let tramposList = [];
        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        tramposList.push(doc.data());
        });
        // tramposList = tramposList.filter((e) => e.owner !== ownerID);
        setTrampos(tramposList);
    };

    const { data: projetosData, error: projetosError, isLoading: projetosLoading, 
        isIdle: projetosIdle, refetch: refetchprojetos } = useProjectsData();

    const [update, setUpdate] = useState(false);

    function setUpUploadData(){
        let promisseList = [];
        let urlList = [];
        imageList.forEach(
            (element, index) => {
                if(element.file){
                    const p = new Promise(
                        (resolve, reject) => {
                            const storageRef = ref(storage, `trampos-${element.origin}/` + element.file.name);
                            const metadata = {
                                contentType: element.file.type,
                            };
                            uploadBytes(storageRef, element.file, metadata).then((snapshot) => {
                                getDownloadURL(snapshot.ref).then((downloadURL) => {
                                    if(element.origin === 'profilePic'){
                                        setFieldValue('pic', downloadURL);
                                    }
                                    else {
                                        urlList.push(downloadURL);
                                    }                                    
                                    resolve(`${element.origin}-${element.index}`);          
                                  });
                              });
                        }
                    );
                    console.log('here')
                    promisseList.push(p);
                }
                else if(element.dataUrl){
                    if(element.origin === 'media')
                    {
                        urlList.push(element.dataUrl);
                    }
                };
            }
        );
        Promise.all(promisseList).then((val) => {
            const cp = [...values.media, ...urlList];
            console.log('promisses complete');
            console.log(cp);
            setFieldValue('media', cp);
            setUpdate(true);
          });
    }

    useEffect(
        () => {
            if(update){
                const gen = nanoid();
                const id = ownerID || gen;
                const docRef = doc(db, "trampos", id); 
                const v = {...values};

                v.media = v.media.filter(ele => ele.trim() !== '');
    
                // console.log(values);
                setDoc(docRef, {...v});
                if(!ownerID){
                    setOwnerID(gen);
                }
                setUpdate(false);
            }
        }, [update]
    );

    async function getTrampoData(url){
        const q = query(collection(db, 'trampos'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setOwnerID(doc.id);
                setCurrent(doc.data());
                // console.log(doc.id, " => ", doc.data());
                });
        }
    };
    async function getUserData(uid){
        const q = query(collection(db, 'users'), where("uid", "==", uid));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setUserOwner(doc.data());
                // console.log(doc.id, " => ", doc.data());
                });
        }
    }

    useEffect(() => {
        getTrampos();
        if(trampo)
        {
            getTrampoData(trampo);  
        }
        else{
            toggleEditingStateFor('info');
        }
    }, [trampo]);

    const { handleChange, values, setFieldValue, handleSubmit, setValues, errors, isValid } = useFormik({
        validationSchema: SignupSchema,
        initialValues: {
            ...initialData
        },
        onSubmit: values => {
            setUpUploadData();
        },
        enableReinitialize: true,
    });

    useEffect(
        () => {
            console.log(errors);
        }, [errors]
    );


    const [markdownValue, setMarkdownValue] = useState('');

    useEffect(() => {
        if(current){
            const c = {...initialData, ...current};
            setValues(c);
            setCenter(current.location);
            setMarkdownValue(current.details);
            getUserData(current.owner);
            setUpImageList();
            console.log(current);
        }
    }, [current]);


    useEffect(() => {
        if(markdownValue){
            setFieldValue('details', markdownValue);
        }
    }, [markdownValue]);
    
    const [editing, setEditing] = useState({});

    function toggleEditingStateFor(key){
        const cp = {...editing};
        const val = cp[key];
        cp[key] = !val;
        setEditing(cp);
    };

    const [places, setPlaces] = useState(null);
    const [center, setCenter] = useState(null);
    const [zoom, setZoom] = useState(15); // initial zoom

    useEffect(() => {
      places?.map(
        (item) => {
          return(
            setCenter({
              lat: item.geometry.location.lat(),
              lng: item.geometry.location.lng(),
              }
            )
          );
        });
      }, [places]);

    useEffect(
        () => {
            if(center)
            {
                setFieldValue('location', center)
            }
        }, [center]
    );

    const[searchBox, setSearchBox] = useState(null);

    function searchBoxOnLoad (ref)
    {
      setSearchBox(ref);
    }

    function handlePlacesChanged(){
        setPlaces(searchBox.getPlaces());
    };

    const [imageList, setImageList] = useState([]);

    function addImage(file, key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (!(i.origin === key && i.index === index)));

        const img = {
            dataUrl: URL.createObjectURL(file),
            file: file,
            origin: key,
            index: index,
        };

        result.push(img);
        setImageList(result);
    };
    const setUpImageList = () => {
        let imgList = [];
        let i = 0;
        current.media?.forEach(
            (element, index) => {
                if(isImage(element)){
                    imgList.push(
                        {
                            dataUrl: element,
                            file: null,
                            origin: 'media',
                            index: i,
                        }
                    );
                    i += 1;
                    setFieldValue(`media[${index}]`, '');
                }
            }
        );
       if(current.pic){
            imgList.push(
                {
                    dataUrl: current.pic,
                    file: null,
                    origin: 'profilePic',
                    index: 0,
                }
            );
       }
        setImageList(imgList);
    };

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
    };

    function removeImage(key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (!(i.origin === key && i.index === index)));

        if(!result){return;}
        const f = removeItemOnce(cp, result[0]);
        setImageList(f);

        // console.log(f);
        
        let fieldCP = [];
        if(key=== 'apoiadores'){
            fieldCP = [...values.apoiadores];
        }

        fieldCP.splice(index, 1);
        setFieldValue(key, [...fieldCP]);
    }

    function getSrc(key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (i.origin === key && i.index === index));

        return result[0]?.dataUrl ?? undefined;
    }

    useEffect(
        () => {
            if(user && !trampo){
                setFieldValue('owner', user.uid);
                setCenter(values.location);
                getUserData(user.uid);
            }
        },[user, trampo]
    );

    function submitValues(key){
        if(!isURLAvailable) { return; }
        toggleEditingStateFor(key);
        handleSubmit();
    }

    const navigate = useNavigate();

    const [isURLAvailable , setIsURLAvailable] = useState(true);

    async function getURLAvailable(url){
        const q = query(collection(db, 'trampos'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || url === current?.url;
    }

    function checkForUniqueURL(e){
        getURLAvailable(e.target.value).then(
            (res) => {
                setIsURLAvailable(res);
            }
        )
    }

    async function deleteJob(){
        if(!ownerID) { return; }
        await deleteDoc(doc(db, "trampos", ownerID));
    }

    return(
        <Grid
        templateRows='repeat(1, 1fr)'
        templateColumns='repeat(3, 1fr)'
        gap={4}
        p='20px'
        >
            <GridItem colSpan={2} bg='#00A195'> 
                {!editing['info']?
                    (current?.media && current.media.length > 0)?
                        <Box
                            width={'full'}
                            minHeight={'315px'}
                            bgRepeat={'no-repeat'}
                            bgPos={'right top'}>
                            <CarouselVideo data={current?.media} />
                        </Box>
                        :
                        <VStack p={'40px'} spacing={'40px'} align={'start'}>
                            {/* <Skeleton w={'full'} h={'450px'} /> */}
                            <Box bgImage={'https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Ftrampos.jpg?alt=media&token=3e0ce6f8-dd61-44ac-8d1e-a4586905fb1e'}
                                height={'402px'} width={'full'} bgSize={'cover'} bgRepeat={'no-repeat'} bgPosition={'center'}
                                bgColor={'#f05d34'}
                                justifyContent={'center'} alignItems={'center'} />
                                <Heading fontSize={'40px'} fontWeight={'bold'}>Projetos:</Heading>
                                {!projetosLoading && projetosData?.length > 0?
                                    <ProjetoCarousel projetos={projetosData} />
                                : null
                                }
                        </VStack> 
                    :
                    <VStack>
                        <Heading>Escolha até três imagens para serem mostradas no Banner</Heading>
                        <Text fontSize={'sm'}>Caso não seja apontada nenhuma imagem ou vídeo, uma lista de projetos será mostrada</Text>
                        <HStack>
                            {[...Array(3)].map(
                                (item, index) => {
                                    return(
                                        <VStack key={index}>
                                            <Image w={'150px'} h={'100px'} src={getSrc('media', index)} fallbackSrc={'https://via.placeholder.com/120x100'} />
                                            <Box w={'120px'} h={'100px'}>
                                            <Input type={'file'} onChange={(e)=>{addImage(e.target.files[0], 'media', index)}} />
                                            </Box>
                                        </VStack>
                                    );
                                }
                            )}
                        </HStack>
                        <Heading>Escolha até três Vídeos de Referência para serem mostrados no Banner</Heading>
                        {values?.media?
                            [...Array(3)].map(
                            (item, index) => {
                                return(
                                    (!isImage(values.media[index]))?
                                        <FormControl bgColor={'whiteAlpha.800'}  isInvalid={errors.media?.length > 0 && errors.media[index]}>
                                            <Input
                                            key={index}
                                            w={'full'}
                                            onChange={handleChange}
                                            id={`media[${index}]`}
                                            placeholder={values.media[index]}
                                            value={values.media[index]} />                                             
                                            <FormErrorMessage>{errors.media?.length > 0 && errors.media[index]}</FormErrorMessage>
                                        </FormControl>
                                    :
                                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.media?.length > 0 && errors.media[index]}>
                                            <Input
                                                key={index}
                                                w={'full'}
                                                onChange={handleChange}
                                                id={`media[${index}]`}
                                                placeholder={values.media[index]}
                                                value={values.media[index]} />                                           
                                            <FormErrorMessage>{errors.media?.length > 0 && errors.media[index]}</FormErrorMessage>
                                        </FormControl>
                                        );
                                })
                            :null}
                    </VStack>
                }
            </GridItem>
            <GridItem colSpan={1} bg='#00A195'>
            {values?.owner === user?.uid && userData && userData?.userType === 'artista'?
                    editing['info']?
                        <HStack>
                            <Button colorScheme={'red'} onClick={() => toggleEditingStateFor('info')}>Cancelar</Button>
                            <Button colorScheme={'blue'} onClick={() => submitValues('info')} disabled={!isValid}>Salvar</Button>
                            <Spacer />
                            {ownerID?
                                <Button colorScheme={'red'} onClick={deleteJob}>Excluir</Button>
                                :null }
                        </HStack>
                        : 
                        <Button onClick={() => toggleEditingStateFor('info')}><EditIcon /></Button>                                           
            : null}
            {!editing['info']? 
                <VStack px={'45px'} py={'15px'} spacing={'30px'}>
                    {values?.title?
                        <Heading fontSize={'40px'} fontWeight={'bold'}>{values.title}</Heading>
                        : <Skeleton h={'32px'} w={'70%'} />
                    }
                    {values?.pic?
                        <Box bgImage={getSrc('profilePic', 0)} bgSize={'contain'} bgRepeat={'no-repeat'} bgPos={'center'} w={'350px'} h={'300px'} />
                        : <Skeleton h={'300px'} w={'350px'} />
                    }
                    {values?
                            values.livre?
                                <Badge colorScheme='green'>Livre para Contratação</Badge>
                                :
                                <Badge colorScheme='red'>Ocupado</Badge>
                        : null
                    }
                    <Stack w={'full'} spacing={'15px'}>                        
                        {values?.habilidades?
                            <VStack align={'start'}>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Habilidades:</Text>
                                <Box w={'full'}>
                                    <Text fontWeight={600} fontSize={'18px'} color={'white'} pl={'10%'}> {values.habilidades}</Text>
                                </Box>                                   
                            </VStack>
                            : <Skeleton h={'32px'} w={'70%'} />
                        }
                        {values?.modelo?
                            <VStack align={'start'} spacing={0}>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Modelo de Trabalho:</Text>
                                <Box w={'full'}>
                                    <Text fontWeight={600} fontSize={'18px'} color={'white'} pl={'10%'}> {values.modelo}</Text>  
                                </Box>  
                            </VStack>
                            : <Skeleton h={'32px'} w={'70%'} />
                        }
                        {values?.categoria?
                            <VStack align={'start'}>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Categoria:</Text>
                                <Box w={'full'}>
                                    <Text fontWeight={600} fontSize={'18px'} color={'white'} pl={'10%'}> {values.categoria}</Text>  
                                </Box>  
                            </VStack>
                            : <Skeleton h={'32px'} w={'70%'} />
                        }
                        {values?.orçamento?
                            <VStack align={'start'}>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Orçamento:</Text>
                                <Box w={'full'}>
                                    <Text fontWeight={600} fontSize={'18px'} color={'white'} pl={'10%'}> {values.orçamento}</Text>    
                                </Box>                           
                            </VStack>
                            : <Skeleton h={'32px'} w={'70%'} />
                        }
                        {values?.pagamento?
                            <VStack  align={'start'}>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Pagamento:</Text>
                                <Box w={'full'}>
                                    <Text fontWeight={600} fontSize={'18px'} color={'white'} pl={'10%'}> {values.pagamento}</Text> 
                                </Box>   
                            </VStack>
                            : <Skeleton h={'32px'} w={'70%'} />
                        }
                        <HStack w={'full'} pt={'30px'}>
                            <Spacer />
                            {values?.livre?
                                <Button fontSize={'16px'} bg={'#5853A2'}
                                width={'164px'} height={'56px'} rounded={0} onClick={
                                    () => {window.location.href = `https://api.whatsapp.com/send/?phone=+55${values?.contact}&text=Olá, encontrei seu contato através da Sala33`}
                                }>Contato</Button>
                                :
                                null
                            }
                            <Spacer />
                            {values?.owner?
                                <Button width={'164px'} height={'56px'} onClick={() => navigate(`/artistas/${values.owner}`)} fontSize={'16px'} bg={'#5853A2'}
                                    size={'lg'} rounded={0}>Perfil
                                </Button>
                                :
                                null
                            }
                            <Spacer />
                        </HStack>
                    </Stack>
                </VStack>
            : 
                <VStack spacing={'40px'} p={'30px'}>
                    <HStack>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.url || !isURLAvailable}>
                            <Tooltip label='Escolha uma URL única para seu perfil' placement='bottom' isOpen={!isURLAvailable}>
                                <InputGroup size='sm'>
                                    <InputLeftAddon children='sala33.com.br/trampos/' />
                                    <Input isInvalid={!isURLAvailable} onChange={handleChange} onBlur={checkForUniqueURL} 
                                    variant={'filled'} id='url' placeholder={values?.url} value={values?.url} />
                                </InputGroup>
                            </Tooltip>
                            <FormErrorMessage>{errors.url}</FormErrorMessage>
                        </FormControl>
                    </HStack>
                    <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.title}>
                        <InputGroup size='sm' >
                            <InputLeftAddon children='Título' />
                            <Input onChange={handleChange} id="title" value={values.title} placeholder={values.title} />
                        </InputGroup>
                        <FormErrorMessage>{errors.title}</FormErrorMessage>
                    </FormControl>
                    <VStack>
                        <Image  src={getSrc('profilePic', 0)} fallbackSrc={'https://via.placeholder.com/350x300'} />
                        <Box w={'120px'}>
                        <Input type={'file'} onChange={(e)=>{addImage(e.target.files[0], 'profilePic', 0)}} />
                        </Box>
                    </VStack>
                    <Checkbox size='lg' id="livre" onChange={handleChange} colorScheme={values.livre? 'green' : 'red'} defaultIsChecked={values.livre}>
                                <Text fontWeight={600} color={'white'}>Livre Para Contato?</Text>
                    </Checkbox>
                    <Stack w={'full'} >
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.habilidades}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Habilidades' />
                                <Input variant={'filled'} onChange={handleChange} id="habilidades" value={values.habilidades} placeholder={values.habilidades} />
                            </InputGroup>
                            <FormErrorMessage>{errors.habilidades}</FormErrorMessage>
                        </FormControl>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.modelo}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Modelo de Trabalho' />
                                <Input variant={'filled'} onChange={handleChange} id="modelo" value={values.modelo} placeholder={values.modelo} />
                            </InputGroup>
                            <FormErrorMessage>{errors.modelo}</FormErrorMessage>
                        </FormControl>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.categoria}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Categoria' />
                                <Input variant={'filled'} onChange={handleChange} id="categoria" value={values.categoria} placeholder={values.categoria} />
                            </InputGroup>
                            <FormErrorMessage>{errors.categoria}</FormErrorMessage>
                        </FormControl>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.orçamento}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Orçamento' />
                                <Input variant={'filled'} onChange={handleChange} id="orçamento" value={values.orçamento} placeholder={values.orçamento} />
                            </InputGroup>
                            <FormErrorMessage>{errors.orçamento}</FormErrorMessage>
                        </FormControl>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.pagamento}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Pagamento' />
                                <Input variant={'filled'} onChange={handleChange} id="pagamento" value={values.pagamento} placeholder={values.pagamento} />
                            </InputGroup>
                            <FormErrorMessage>{errors.pagamento}</FormErrorMessage>
                        </FormControl>
                        <FormControl bgColor={'whiteAlpha.800'} isInvalid={errors.contato}>
                            <InputGroup w={'200px'}>
                                <InputLeftElement
                                pointerEvents='none'
                                children={<PhoneIcon color='gray.300' />}
                                    />
                                <Input
                                as={ReactInputMask} mask="(**) *****-****" maskChar={null}
                                onChange={handleChange} variant={'filled'} 
                                id='contact' placeholder={"(**) *****-****"} value={values?.contact} />
                            </InputGroup>     
                            <FormErrorMessage>{errors.contato}</FormErrorMessage>
                        </FormControl>
                    </Stack>
                </VStack>}
            </GridItem>
            <GridItem colSpan={3} bg='#00A195'>
                {values?.location? 
                    <LoadScript id="script-loader" googleMapsApiKey={process.env.REACT_APP_API_GOOGLE_API} libraries={libraries}>
                        {editing['info']
                            ?<StandaloneSearchBox
                                onLoad={searchBoxOnLoad}
                                onPlacesChanged={handlePlacesChanged}
                                >
                                <input
                                id="local"
                                value={values.local}
                                onChange={handleChange}
                                type="text"
                                placeholder="Local do Trabalho"
                                style={{
                                    boxSizing: `border-box`,
                                    border: `1px solid transparent`,
                                    width: `240px`,
                                    height: `32px`,
                                    padding: `0 12px`,
                                    borderRadius: `3px`,
                                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                    fontSize: `14px`,
                                    outline: `none`,
                                    textOverflow: `ellipses`
                                }}
                                />
                            </StandaloneSearchBox>
                            : null
                        }
                            <AspectRatio ratio={16 / 5}>
                            <GoogleMap
                                mapContainerStyle={{width: '100%'}}
                                center={center}
                                zoom={zoom}
                            >                                 
                                <Circle
                                // required
                                center={center}
                                // required
                                options={circleOptions}
                                />
                            </GoogleMap>
                            </AspectRatio> 
                    </LoadScript>
                    : null}
            </GridItem>
            <GridItem colSpan={2} bg='#00A195'>
            <Box>
                <Heading p={'20px'}>Informações sobre o trabalho</Heading>
            </Box>
            {!editing['info']?  
                markdownValue?
                
                    <MDEditor.Markdown
                    source={markdownValue}
                    rehypePlugins={[[rehypeSanitize]]}
                    />
                : <SkeletonText p={'60px'} mt='4' noOfLines={16} spacing='4' />
            : 
                <Box p={'20px'} w={'full'} h={'600px'}>
                    <MDEditor
                    height={'500px'}
                    value={markdownValue}
                    onChange={setMarkdownValue}
                    previewOptions={{
                    rehypePlugins: [[rehypeSanitize]],
                    }}/>
                </Box>}
            </GridItem>
            <GridItem colSpan={1} bg='#00A195'>
                <VStack px={'10px'} py={'40px'} spacing={'40px'} w='full'>
                    <VStack spacing={'5px'} w='full'>
                        {userOwner?
                            userOwner.profilePic?
                                <Avatar size={'2xl'} src={userOwner.profilePic} />
                            : <SkeletonCircle h={'200px'} w={'200px'}/>
                        :null}
                        {userOwner?
                            userOwner.name?
                                <Heading fontSize={'40px'} fontWeight={'bold'}>{userOwner.name}</Heading>
                            : <Skeleton h={'32px'} w={'70%'} />
                        :null}
                        {userOwner?
                            userOwner.title?
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}>{userOwner.title}</Text>
                            : <Skeleton h={'32px'} w={'70%'} />
                        :null}
                        <Box w={'full'}>
                            {userOwner?
                                userOwner.miniBio?
                                    <Center>
                                        <Text fontWeight={600} fontSize={'20px'} textAlign='center'>{userOwner.miniBio}</Text>
                                    </Center>
                                : <SkeletonText mt='4' noOfLines={6} spacing='4' />
                            :null}
                        </Box>
                    </VStack>
                    <Stack w={'90%'} spacing={'20px'}>
                        <VStack w={'full'} display={'block'}>
                            {(userOwner && userOwner.habilidades?.length > 0)?
                                userOwner.habilidades?.map(
                                    (item, index) => {
                                        return(
                                            <SkillBar labelWidth={200} key={index} color={'#FCB022'} flat {...item} />
                                        );
                                    }
                                )                    
                            : 
                                <Box w={'full'}>
                                    <SkeletonText mt='4' noOfLines={2} spacing='4' />
                                </Box>} 
                        </VStack>
                        <VStack w={'full'} display={'block'}>
                            {(userOwner && userOwner.softwares?.length > 0)?
                                userOwner.softwares?.map(
                                    (item, index) => {
                                        return(
                                            <SkillBar labelWidth={200} key={index} color={'#7975B5'} flat {...item} />
                                        );
                                    }
                                )                    
                            :   <Box w={'full'}>
                                    <SkeletonText mt='4' noOfLines={2} spacing='4' />
                                </Box>}
                        </VStack>
                        <VStack w={'full'} display={'block'}>
                            {(userOwner && userOwner.idiomas?.length > 0)?
                                userOwner.idiomas?.map(
                                    (item, index) => {
                                        return(
                                            <SkillBar labelWidth={200} key={index} color={'#F37D5D'} flat {...item} />
                                        );
                                    }
                                )                    
                            : 
                                <Box w={'full'}>
                                    <SkeletonText mt='4' noOfLines={2} spacing='4' />
                                </Box> } 
                        </VStack>
                    </Stack>
                </VStack>             
            </GridItem>
            <GridItem colSpan={3} bgColor={'#FDD07A29'} w={'full'} px={'80px'} pb={'80px'} pt={'15px'}>
                <VStack spacing={'30px'} >
                    <Heading>Outras Oportunidades</Heading>
                    {trampos?.length > 0?
                        <SliderCarousel trampos={trampos} />
                    : null
                    }
                </VStack>
            </GridItem>
        </Grid>
    );
};

export default TrampoPage;
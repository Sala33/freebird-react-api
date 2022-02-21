import { AddIcon, DeleteIcon, EditIcon, PhoneIcon } from "@chakra-ui/icons";
import {  AspectRatio, Avatar, Badge, Box, Button, Center, Checkbox, Flex, FormControl, FormErrorMessage, FormHelperText, Grid, GridItem, Heading, HStack, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightElement, Link, Skeleton, SkeletonCircle, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spacer, Stack, Text, Textarea, Tooltip, VStack } from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useFormik } from "formik";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, useParams } from "react-router-dom";
import { SocialIcon } from "react-social-icons";
import { auth, db, storage } from "../../../utils/firebase";
import { SkillBar } from 'react-skills';
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Carousel } from "react-responsive-carousel";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import SliderCarousel from "../../SliderCarousel";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import ReactInputMask from "react-input-mask";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as Yup from 'yup';
import { useUserReviews } from "../../../hooks/useReview";
import { useUserData, useUserDataUrl } from "../../../hooks/useUserData";
import { useUserTramposData } from "../../../hooks/useTramposData";
import { useMutation } from "react-query";
import { nanoid } from "nanoid";
import IdentityContext from "../../../Context/IdentityContext";

const SignupSchema = Yup.object().shape({
    name: Yup.string().max(100, 'Nome muito Longo').required('Nome é obrigatório!'),
    affiliation: Yup.string().required('Data Obrigatória!'),
    contact: Yup.string().required('Dados de contato obrigatório'),
    miniBio: Yup.string().max(350, 'Mini biografia muito longa').required('Mini biografia é obrigatória!'),
    segmentos: Yup.array(Yup.string().required('Forneça até 5 tags')).min(1, 'Forneça Tags').max(5, 'Muitas Tags').required('Adicione Tags'),
    socialMedia: Yup.array(Yup.string().url('Deve ser um link válido de mídias sociais').required('Adicione até 8 links de media.'))
            .max(8, 'Mais de oito links encontrados')
            .notRequired(),
            ocupacoes: Yup.array(Yup.string().required('Forneça até 3 ocupações')).min(1, 'Forneça Ocupações').max(3, 'Muitas Ocupações').required('Adicione Ocupações'),
    title: Yup.string().max(250, 'Título muito longo'),
    writeUp: Yup.string().max(10000, 'Apresentação muito longa'),
    horaPreco: Yup.number().positive().nullable().typeError('Deve ser um número, utilize pontos para decimais'),
    url: Yup.string().required('A url é obrigatória na criação'),
    habilidades: Yup.array(Yup.object().shape({name: Yup.string().required('Nomeie uma Habilidade'), level: Yup.number().positive().typeError('Deve ser um número.')})),
    softwares: Yup.array(Yup.object().shape({name: Yup.string().required('Nomeie um Software'), level: Yup.number().positive().typeError('Deve ser um número.')})),
    idiomas: Yup.array(Yup.object().shape({name: Yup.string().required('Nomeie uma Idioma'), level: Yup.number().positive().typeError('Deve ser um número.')})),
  });
const initialData = {
    name: '',
    affiliation: format(Date.now(), 'dd/MM/yyyy'),
    banner: '',
    contact: '',
    habilidades: [{name: '', level: 0}],
    softwares: [{name: '', level: 0}],
    idiomas: [{name: '', level: 0}],
    miniBio: '',
    ocupacoes: [],
    profilePic: '',
    segmentos: [],
    socialMedia: [],
    title: '',
    writeUp: '',
    horaPreco:250,
    url: '',
}

const ArtistPage = (props) => {
    const { artista } = useParams();
    
    const [uri, setUri] = useState(artista);

    const { data: artistData, error: artistError, isLoading: artistLoading, isIdle: artistIdle, refetch: refetchArtist } = useUserDataUrl(uri);

    const [artistaInfo, setArtistaInfo] = useState(null);
    const [user] = useAuthState(auth);
    const [userDataContext, setUserDataContext] = useContext(IdentityContext);

    useEffect(
        () => {
            if(!artista && user){
                toggleEditingStateFor('info');
                setUri(user.uid);
            }
        },[artista, user]
    );
   
    const [notFound, setNotFound] = useState(false);

    useEffect(
        () => {
            if(!artistIdle && !artistLoading && !artistData){
                setNotFound(true);
            } else if (artistData) {
                setArtistaInfo(artistData);
            }
        }, [artistData, artistLoading]
    );


    const [review, setReview] = useState(null);
    const [uid, setUID] = useState(null);

    useEffect(
        ()=>{
            if(user)
            {
                setUID(user.uid);
            }
        },[user]
    );

    const { data: userData, error: userError, isLoading: userLoading, } = useUserData(uid);
    const { data: userReviews, error: reviewError, isLoading: reviewsLoading, refetch: refetchReviews } = useUserReviews(artistaInfo?.uid, 'artista');

    const { data: trampos, isLoading: tramposLoading } = useUserTramposData(artistaInfo?.uid);

    useEffect(
        ()=>{
            if(artistaInfo){
                if(!artistaInfo.url){
                    artistaInfo.url = artistaInfo.uid;
                }
                const init ={...initialData, ...artistaInfo};
                setMarkdownValue(artistaInfo.writeUp);
                setValues(init);
            }
        },[artistaInfo]
    );

    const { handleChange, values, setValues, handleSubmit,setFieldValue, errors, isValid } = useFormik({
        validationSchema:SignupSchema,
        initialValues: {
            ...initialData,
        },
        onSubmit: values => {
            userSubmit();
        },
        enableReinitialize: true,
    });

    const [editing, setEditing] = useState({});

    function toggleEditingStateFor(key){
        const cp = {...editing};
        const val = cp[key];
        cp[key] = !val;
        setEditing(cp);
    };

    function submitValues(key){
        toggleEditingStateFor(key);
        handleSubmit();
    }

    const bannerRef = useRef();

    const [markdownValue, setMarkdownValue] = useState('');

    useEffect(() => {
        if(markdownValue){
            setFieldValue('writeUp', markdownValue);
        }
    }, [markdownValue]);


    function submitReview(){
        if(!review || !userDataContext) { return; }
        const docRef = doc(db, 'reviews', nanoid(21));
        setDoc(docRef, {
            data: format(Date.now(), 'MM/dd/yyyy'),
            owner: artistaInfo.uid,
            profilePic: userDataContext.profilePic || 'undefined',
            reviewer: userDataContext.userName,
            reviwerId: userDataContext.uid,
            text: review,
            tipo: 'artista',
            title: userData.title || 'usuário'
        });
        setReview('');
        refetchReviews();
    }

    const inputRef = useRef();

    const [image , setImage] = useState('');
    const [banner , setBanner] = useState('');
    const [bannerPreview , setBannerPreview] = useState(null);
    const [profilePreview , setProfilePreview] = useState(null);

    useEffect(
        () => {
            if(image) {
                setProfilePreview(URL.createObjectURL(image));
            }
        }, [image]
    );

    useEffect(
        () => {
            if(banner) {
                setBannerPreview(URL.createObjectURL(banner));
            }
        }, [banner]
    );

    useEffect(
        () => {
            if(!editing) {
                setProfilePreview(null);
                setBannerPreview(null);
            }
        }, [editing]
    );

    const DatePickerCustom = forwardRef(({ value, onClick }, ref) => (
        <Button size={'sm'} className="example-custom-input" onClick={onClick} ref={ref}>
          {value}
        </Button>
    ));

    function getDateFromString(dateString){
        if(!dateString){dateString = format(Date.now(), 'dd/MM/yyyy')}
        var date= dateString.split("/");
        var f = new Date(date[2], date[1] -1, date[0]);
        return f;
    };

    function setStringDate(key, value){
        const d = format(value, 'dd/MM/yyyy');
        setFieldValue(key, d);
    };

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
      };

    const deleteSocial = (value) => {
        let cp = [...values.socialMedia];
        cp = removeItemOnce(cp, value);
        setFieldValue('socialMedia', cp);
    };
    const deleteOcupacoes = (value) => {
        let cp = [...values.ocupacoes];
        cp = removeItemOnce(cp, value);
        setFieldValue('ocupacoes', cp);
    };
    const deleteSegmento = (value) => {
        let cp = [...values.segmentos];
        cp = removeItemOnce(cp, value);
        setFieldValue('segmentos', cp);
    };
    const deleteHabilidades = (index) => {
        let cp = [...values.habilidades];
        cp.splice(index,1)
        setFieldValue('habilidades', cp);
    };
    const deleteSoftware = (index) => {
        let cp = [...values.softwares];
        cp.splice(index,1)
        setFieldValue('softwares', cp);
    };
    const deleteIdiomas = (index) => {
        let cp = [...values.idiomas];
        cp.splice(index,1)
        setFieldValue('idiomas', cp);
    };

    const profilePicMutation = useMutation(
        (file) => {
            const storageRef = ref(storage, `artistas-profile/${uid}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue('profilePic', url);
                        const p = {profilePic: url};
                        updateFieldMutation.mutate(p);
                    }
                );         
            },
        }
    );

    const bannerPicMutation = useMutation(
        (file) => {
            const storageRef = ref(storage, `artistas-banner/${uid}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue('banner', url);
                        const p = {banner: url};
                        updateFieldMutation.mutate(p);
                    }
                );         
            },
        }
    );

    const updateFieldMutation = useMutation(
        (field) => {
            if(!artistData?.id){ return; }
            const userRef = doc(db, 'users', artistData.id);
            // Set the 'capital' field of the city
           return updateDoc(userRef, {...field});
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success ProfilePic');
            },
        }
    );

    async function uploadProfile(file){

        if(!artistData?.id) { return; }

        profilePicMutation.mutate(file);
    };

    async function uploadBanner(file){

        if(!artistData?.id) { return; }
        bannerPicMutation.mutate(file);

    };

    const [isURLAvailable , setIsURLAvailable] = useState(true);

    async function getURLAvailable(url){
        const q = query(collection(db, 'artistas'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || url === artistaInfo?.url;
    }

    function checkForUniqueURL(e){
        getURLAvailable(e.target.value).then(
            (res) => {
                setIsURLAvailable(res);
            }
        )
    }

    const updateUser = useMutation(
        () => {
            const id = artistData.id;
            const docRef = doc(db, "users", id);
            setDoc(docRef, {...values});
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Updating Profile');
               refetchArtist();
            },
        }
    );


    async function userSubmit(){
        if(!isURLAvailable || !artistData?.id) { return; }

        updateUser.mutate();
    };

    const deleteCommentMutation = useMutation(
        (comment) => {
            const id = comment.id;
            deleteDoc(doc(db, "reviews", id));
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Deleting Review');
               refetchReviews();
            },
        }
    );

    function deleteComment(comment){
        deleteCommentMutation.mutate(comment);
    }

  return(
      <VStack px={'55px'} py={'70px'} width={'full'} spacing={'70px'}>
            <Grid
            width={'full'}
            minHeight='1413px'
            templateRows='repeat(1, 1fr)'
            templateColumns='repeat(5, 1fr)'
            gap={4}
            >
                <GridItem colSpan={2} bg='#FDD07A1f' >
                    <Flex w={'full'} justifyContent={'end'} p={'20px'}>
                    {values?.uid === user?.uid && userData && userData?.userType === 'artista'?
                        editing['info']?
                            <HStack>
                                <Button colorScheme={'red'} onClick={() => {
                                    toggleEditingStateFor('info')
                                    }}>Cancelar</Button>
                                <Button colorScheme={'blue'} onClick={() => submitValues('info')} disabled={!isValid}>Salvar</Button>
                            </HStack>
                            : 
                            <Button onClick={() => toggleEditingStateFor('info')}><EditIcon /></Button>                                           
                    : null}
                    </Flex>
                    <VStack spacing={'15px'}>
                        <VStack py={'40px'} spacing={'10px'}>
                            {editing['info']?
                                <HStack>
                                    <FormControl isInvalid={errors.url || !isURLAvailable}>
                                        <Tooltip label='Escolha uma URL única para seu perfil' placement='bottom' isOpen={!isURLAvailable}>
                                            <InputGroup size='sm'>
                                                <InputLeftAddon children='sala33.com.br/artistas/' />
                                                <Input isInvalid={!isURLAvailable} onChange={handleChange} onBlur={checkForUniqueURL} 
                                                variant={'filled'} id='url' placeholder={'Forneça uma URL'} value={values?.url} />
                                            </InputGroup>
                                        </Tooltip>
                                        <FormErrorMessage>{errors.url || !isURLAvailable}</FormErrorMessage>
                                    </FormControl>
                                </HStack>
                                : null
                            }
                            {!editing['info']?
                                values?.profilePic && values?.name?
                                    <Avatar height={'120px'} width={'120px'} name={values.name} src={profilePreview? profilePreview : values.profilePic} />
                                : <SkeletonCircle  height={'120px'} width={'120px'} />
                            :                                 
                                <Tooltip label='500x500' placement='top'>
                                    <HStack>
                                        <Avatar height={'120px'} width={'120px'} name={values.name} src={profilePreview? profilePreview : values.profilePic} />
                                        <Input ref={inputRef} hidden type="file" onChange={(e)=>uploadProfile(e.target.files[0])}/>
                                        <Button disabled={!artistData?.id} padding={0} size={'sm'} colorScheme={'whiteAlpha'} position={'relative'} left={'-65px'} bottom={-30} zIndex={2} onClick={() => inputRef.current.click()}>
                                            <EditIcon />
                                        </Button>
                                    </HStack>
                                </Tooltip>
                            }
                            {!editing['info']?
                                values?.name && values?.affiliation?
                                    <VStack>
                                        <Center>
                                            <Heading fontSize={'30px'}>{values.name}</Heading>
                                        </Center>
                                        <Center>
                                            <Heading fontSize={'15px'}>Artista</Heading>
                                        </Center>
                                        <Text>{values?.title}</Text>
                                        <Heading fontSize={'20px'}>Cadastrado em: {values.affiliation}</Heading>
                                        <Text fontSize={'20px'} fontWeight={600}>Valor médio da hora: <Text as={'span'} color={'green'}>R${values?.horaPreco}</Text></Text>
                                    </VStack>
                                : null                        
                            :
                                    <VStack spacing={'15px'} w={'full'}>
                                        <FormControl isInvalid={errors.name}>
                                            <InputGroup size='sm' >
                                                <InputLeftAddon children='Nome' />
                                                <Input onChange={handleChange} id="name" value={values.name} placeholder={'Seu Nome'} />
                                            </InputGroup>
                                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={errors.title}>
                                            <InputGroup size='sm' >
                                                <InputLeftAddon children='Título' />
                                                <Input onChange={handleChange} id="title" value={values.title} placeholder={'Uma descrição para você'} />
                                            </InputGroup>
                                            <FormErrorMessage>{errors.title}</FormErrorMessage>
                                            <FormHelperText>Pequena descrição do seu cargo.</FormHelperText>
                                        </FormControl>
                                        <Center>
                                            <HStack w={'full'}>
                                                <Text fontWeight={500} whiteSpace={'nowrap'}>Cadastrado em: </Text> 
                                                <DatePicker 
                                                selected={getDateFromString(values.affiliation)} 
                                                onChange={(date) => setStringDate('affiliation', date)} 
                                                dateFormat="dd/MM/yyyy"
                                                customInput={<DatePickerCustom />}
                                                />
                                            </HStack>
                                        </Center>
                                        <FormControl isInvalid={errors.horaPreco}>
                                            <InputGroup size='sm' >
                                                <InputLeftAddon children='Hora R$' />
                                                <Input onChange={handleChange} id="horaPreco" value={values.horaPreco} placeholder={'Preço da sua hora'} />
                                            </InputGroup>
                                            <FormErrorMessage>{errors.horaPreco}</FormErrorMessage>
                                        </FormControl>
                                    </VStack>
                            }
                            {!editing['info']?                         
                                <HStack px={'5px'} mt={'30px'}>
                                    {(values.socialMedia && values.socialMedia?.length !== 0)?
                                        values?.socialMedia?.map(
                                            (url, index) => {
                                                return(
                                                    <SocialIcon key={index} url={url} style={{ height: 32, width: 32 }}/>
                                                );
                                            }
                                        )
                                        :
                                        <Skeleton w={'200px'} h={'32px'} />
                                    }        
                                </HStack> 
                            :
                                <Box w={'full'}>    
                                    <Heading fontWeight={'extrabold'} fontSize={'25px'}>Social Media</Heading>
                                    {values?.socialMedia?.map(
                                            (url, index) => {
                                                return(
                                                    <HStack key={`stackSocial-${index}`}>
                                                        <FormControl isInvalid={errors.socialMedia?.length > 0 && errors.socialMedia[index]}>
                                                            <InputGroup size='sm' width={'300px'}>
                                                                <InputLeftAddon children='Link:' />
                                                                <Input key={`edit${index}`}
                                                                    onChange={handleChange}
                                                                    id={`socialMedia[${index}]`}
                                                                    variant={'filled'} 
                                                                    placeholder={'Um link para uma mídia social'} value={values.socialMedia[index]} />
                                                            </InputGroup>   
                                                            <FormErrorMessage>{errors.socialMedia?.length > 0 && errors.socialMedia[index]}</FormErrorMessage>
                                                        </FormControl>                                                 
                                                        <Link onClick={() => deleteSocial(url)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                    </HStack>
                                                );
                                            }
                                    )}
                                </Box>
                            }
                            {editing['info'] && values.socialMedia?.length < 10
                                ?   <Link onClick={() => setFieldValue('socialMedia', [...values.socialMedia, ''])}><AddIcon /></Link> 
                                :  null 
                            }
                        </VStack>
                        <VStack spacing={0} pb={'28px'}>
                            {!editing['info']?
                                <Flex flexDir={'column'} width={'full'} height={'165px'}
                                    justifyContent={'center'} alignItems={'start'}
                                    pl={'62px'} pr={'34px'} pt={'26px'} pb={'75px'}>
                                    <Heading fontSize={'25px'} fontWeight={'extrabold'}>Ocupações</Heading>
                                    <br />
                                    <Box w={'full'}>
                                        {(values.ocupacoes && values.ocupacoes.length !== 0)? 
                                        <VStack w={'full'} align={'start'}>
                                            {values.ocupacoes.map(
                                                (item, index) => {
                                                    return(
                                                        <Checkbox key={index} colorScheme={'green'} isChecked>{item}</Checkbox>
                                                    );
                                                }
                                            )}
                                        </VStack>
                                        :  <Skeleton w={'400px'} h={'100px'} />}
                                    </Box>
                                </Flex> 
                            :
                            <Stack w={'full'} pt={'26px'} pb={'75px'}>
                                <Heading fontWeight={'extrabold'} fontSize={'25px'}>Ocupações</Heading>
                                {values?.ocupacoes?.map(
                                    (url, index) => {
                                        return(
                                            <HStack key={`stackSocial-${index}`}>
                                                <FormControl isInvalid={errors.ocupacoes?.length > 0 && errors.ocupacoes[index]}>
                                                    <InputGroup size='sm' width={'300px'}>
                                                        <InputLeftAddon children='Ocupação' />
                                                        <Input key={`edit${index}`}
                                                            onChange={handleChange}
                                                            id={`ocupacoes[${index}]`}
                                                            variant={'filled'} 
                                                            placeholder={'Ocupações'} value={values.ocupacoes[index]} />
                                                    </InputGroup>                                                    
                                                    <FormErrorMessage>{errors.ocupacoes?.length > 0 && errors.ocupacoes[index]}</FormErrorMessage>
                                                </FormControl>
                                                <Link onClick={() => deleteOcupacoes(url)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                            </HStack>
                                        );
                                    }
                                )} 
                            </Stack>
                            }
                            {editing['info'] && (values.ocupacoes?.length < 5 || !values.ocupacoes)
                                ?   <Link onClick={() => {
                                            if(values.ocupacoes){
                                                setFieldValue('ocupacoes', [...values.ocupacoes, ''])
                                            } else {
                                                setFieldValue('ocupacoes', [''])
                                            }
                                        }}><AddIcon /></Link> 
                                :  null 
                            }
                            <Flex flexDirection={'column'} width={'full'}
                                justifyContent={'center'} alignItems={'center'}>
                                <VStack width={'80%'} pt={'26px'} pb={'75px'}>
                                    <Heading fontWeight={'extrabold'} fontSize={'25px'}>Bio</Heading>
                                    {!editing['info']?
                                        values?.miniBio?                                   
                                            <Text as={'i'} fontWeight={'bold'} fontSize={'20px'}>{values.miniBio}</Text>
                                        :
                                            <Skeleton w={'400px'} h={'200px'}></Skeleton>
                                    :
                                        <VStack>
                                            <FormControl isInvalid={errors.miniBio}>
                                                <Textarea variant={'filled'} value={values.miniBio} id="miniBio" w={'400px'} height={'200px'} 
                                                    onChange={handleChange} placeholder={'Mini Biografia'} />                                             
                                                <FormErrorMessage>{errors.miniBio}</FormErrorMessage>
                                                <FormHelperText>Adicionar uma Biografia faz você aparecer na lista de artistas.</FormHelperText>
                                            </FormControl>
                                        </VStack>
                                    }     
                                </VStack> 
                            </Flex>
                            <VStack width={'full'} pt={'26px'} pb={'75px'}>
                                    <Heading fontWeight={'extrabold'} fontSize={'25px'}>Habilidades</Heading>                            
                                    {!editing['info']?
                                        values?.habilidades? 
                                            <VStack w={'80%'} display={'block'}>
                                                {values.habilidades?.map(
                                                    (item, index) => {
                                                        return(
                                                            <SkillBar labelWidth={200} key={index} color={'#FCB022'} flat {...item} />
                                                        );
                                                    }
                                                ) }
                                            </VStack>   
                                        :
                                        <Skeleton w={'200px'} h={'200px'}></Skeleton>
                                    : 
                                    values.habilidades?.map(
                                        (item, index) => {
                                            return(
                                                <Box key={`edit${index}`} w={'50%'}>
                                                    <FormControl isInvalid={errors.habilidades?.length > 0 && errors.habilidades[index]?.name}>
                                                        <InputGroup size='sm' width={'300px'}>
                                                            <InputLeftAddon children='Habilidade' />
                                                            <Input 
                                                                onChange={handleChange}
                                                                id={`habilidades[${index}].name`}
                                                                variant={'filled'} 
                                                                placeholder={'Uma Habilidade'} value={values.habilidades[index].name} />
                                                                <Link onClick={() => deleteHabilidades(index)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                        </InputGroup>                                                 
                                                        <FormErrorMessage>{errors.habilidades?.length > 0 && errors.habilidades[index]?.name}</FormErrorMessage>
                                                    </FormControl>
                                                    <Box>
                                                        <Slider aria-label='slider-ex-1' defaultValue={item.level} 
                                                                onChangeEnd={(val) => setFieldValue(`habilidades[${index}].level`, Number(val))}>
                                                                <SliderTrack>
                                                                    <SliderFilledTrack />
                                                                </SliderTrack>
                                                            <SliderThumb />
                                                        </Slider>
                                                    </Box>
                                                </Box>
                                            );
                                        }
                                    )}
                                    {editing['info'] && (values.habilidades?.length < 5 || !values.habilidades)
                                        ?   <Link onClick={() => {
                                                    if(values.habilidades){
                                                        setFieldValue('habilidades', [...values.habilidades, {name: '', level: 0}]);
                                                    } else {
                                                        setFieldValue('habilidades', [{name: '', level: 0}]);
                                                    }
                                                }}><AddIcon /></Link> 
                                        :  null 
                                    }                               
                            </VStack> 
                            <VStack width={'full'} pt={'26px'} pb={'75px'}>
                                    <Heading fontWeight={'extrabold'} fontSize={'25px'}>Software</Heading>
                                    
                                    {!editing['info']?
                                        values?.softwares? 
                                            <VStack w={'80%'} display={'block'}>
                                                {values.softwares?.map(
                                                    (item, index) => {
                                                        return(
                                                            <SkillBar labelWidth={200} key={index} color={'#7975B5'} flat {...item} />
                                                        );
                                                    }
                                                ) }
                                            </VStack>   
                                        :
                                        <Skeleton w={'200px'} h={'200px'}></Skeleton>
                                    : 
                                    values.softwares?.map(
                                        (item, index) => {
                                            return(
                                                <Box key={`edit${index}`} w={'50%'}>
                                                    <FormControl isInvalid={errors.softwares?.length > 0 && errors.softwares[index]?.name}>
                                                        <InputGroup size='sm' width={'300px'}>
                                                            <InputLeftAddon children='Software' />
                                                            <Input 
                                                                onChange={handleChange}
                                                                id={`softwares[${index}].name`}
                                                                variant={'filled'} 
                                                                placeholder={'Um software'} value={values.softwares[index].name} />
                                                                <Link onClick={() => deleteSoftware(index)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                        </InputGroup>                                               
                                                        <FormErrorMessage>{errors.softwares?.length > 0 && errors.softwares[index]?.name}</FormErrorMessage>
                                                    </FormControl>
                                                    <Slider aria-label='slider-ex-1' defaultValue={item.level} 
                                                        onChangeEnd={(val) => setFieldValue(`softwares[${index}].level`, Number(val))}>
                                                        <SliderTrack>
                                                            <SliderFilledTrack />
                                                        </SliderTrack>
                                                    <SliderThumb />
                                                    </Slider>
                                                </Box>
                                            );
                                        }
                                    )}
                                    {editing['info'] && (values.softwares?.length < 5 || !values.softwares)
                                        ?   <Link onClick={() => {
                                                if(values.softwares){
                                                    setFieldValue('softwares', [...values.softwares, {name: '', level: 0}]);
                                                } else {
                                                    setFieldValue('softwares', [{name: '', level: 0}]);
                                                }
                                                }}><AddIcon /></Link> 
                                        :  null 
                                    }
                            </VStack> 
                            <VStack width={'full'} pt={'26px'} pb={'75px'}>
                                    <Heading fontWeight={'extrabold'} fontSize={'25px'}>Idiomas</Heading>                                   
                                    {!editing['info']?
                                        values?.idiomas? 
                                            <VStack w={'80%'} display={'block'}>
                                            {values.idiomas?.map(
                                                (item, index) => {
                                                    return(
                                                        <SkillBar labelWidth={200} key={index} color={'#F37D5D'} flat {...item} />
                                                    );
                                                }
                                            )  }
                                            </VStack>  
                                        :
                                        <Skeleton w={'200px'} h={'200px'}></Skeleton>
                                    : 
                                    values.idiomas?.map(
                                        (item, index) => {
                                            return(
                                                <Box key={`edit${index}`} w={'50%'}>
                                                    <FormControl isInvalid={errors.idiomas?.length > 0 && errors.idiomas[index]?.name}>
                                                        <InputGroup size='sm' width={'300px'}>
                                                            <InputLeftAddon children='Idiomas' />
                                                            <Input 
                                                                onChange={handleChange}
                                                                id={`idiomas[${index}].name`}
                                                                variant={'filled'} 
                                                                placeholder={'Um idioma'} value={values.idiomas[index].name} />
                                                                <Link onClick={() => deleteIdiomas(index)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                        </InputGroup>                                          
                                                        <FormErrorMessage>{errors.idiomas?.length > 0 && errors.idiomas[index]?.name}</FormErrorMessage>
                                                    </FormControl>
                                                    <Slider aria-label='slider-ex-1' defaultValue={item.level} 
                                                        onChangeEnd={(val) => setFieldValue(`idiomas[${index}].level`, Number(val))}>
                                                        <SliderTrack>
                                                            <SliderFilledTrack />
                                                        </SliderTrack>
                                                    <SliderThumb />
                                                    </Slider>
                                                </Box>
                                            );
                                        }
                                    )}
                                    {editing['info'] && (values.idiomas?.length < 5 || !values.idiomas)
                                        ?   <Link onClick={() => {
                                                if(values.idiomas){
                                                    setFieldValue('idiomas', [...values.idiomas, {name: '', level: 0}]);
                                                } else {
                                                    setFieldValue('idiomas', [{name: '', level: 0}]);
                                                }
                                                }}><AddIcon /></Link> 
                                        :  null 
                                    }
                            </VStack> 
                            <VStack width={'full'} spacing={'20px'}
                                pt={'26px'} pb={'75px'}>
                                <Heading fontWeight={'extrabold'} fontSize={'25px'}>Segmentos de Atuação</Heading>
                                <Center w={'full'}>
                                {!editing['info']?
                                    (values.segmentos && values.segmentos.length !== 0)?
                                    <HStack>
                                        {values.segmentos.map(
                                            (item, index) => {
                                                return(
                                                    <Badge fontSize={'18px'} key={index} variant='subtle' colorScheme='gray'>
                                                        {item}
                                                    </Badge>
                                                );
                                            }
                                        )}
                                    </HStack>
                                    :<Skeleton h={'32px'} w={'60%'} />
                                :
                                    <VStack>
                                    {values?.segmentos?.map(
                                        (url, index) => {
                                            return(
                                                <HStack key={`stackSocial-${index}`}>
                                                    <FormControl isInvalid={errors.segmentos?.length > 0 && errors.segmentos[index]}>
                                                        <InputGroup size='sm' width={'300px'}>
                                                            <InputLeftAddon children='Segmento de atuação' />
                                                            <Input key={`edit${index}`}
                                                                onChange={handleChange}
                                                                id={`segmentos[${index}]`}
                                                                variant={'filled'}
                                                                placeholder={'Segmento de atuação'} value={values.segmentos[index]} />
                                                        </InputGroup>                                               
                                                        <FormErrorMessage>{errors.segmentos?.length > 0 && errors.segmentos[index]}</FormErrorMessage>
                                                    </FormControl>                                             
                                                    <Link onClick={() => deleteSegmento(url)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                </HStack>
                                            );
                                        }
                                    )}
                                    </VStack>
                                    }
                                    {editing['info'] && values.segmentos?.length < 5
                                        ?   <Link onClick={() => {setFieldValue('segmentos', [...values.segmentos, ''])
                                                }}><AddIcon /></Link> 
                                        :  null 
                                    }
                                </Center>
                            </VStack>
                            {!editing['info']?
                                    <Button fontSize={'16px'} bg={'#00A195'}
                                    width={'164px'} height={'56px'} rounded={0} onClick={
                                        () => {window.location.href = `https://api.whatsapp.com/send/?phone=+55${values?.contact}&text=Olá, encontrei seu contato através da Sala33`}
                                    }>Fale Comigo</Button>
                                    :
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
                                }
                        </VStack>
                    </VStack>
                </GridItem>
                <GridItem colSpan={3} bg='#99D9D51F'>
                    <VStack pb={'28px'}>
                        {!editing['info']?
                            values?.banner?                             
                                <Box bgColor={'#BBBBBB'} width={'full'} height={'398px'} p={'15px'}
                                    backgroundImage={bannerPreview? bannerPreview : values.banner} backgroundSize={'100%'}
                                    backgroundRepeat={'no-repeat'} justifyContent={'end'}>
                                </Box>
                                :
                                <Skeleton width={'full'} height={'398px'}/>
                            :
                            <Box bgColor={'#BBBBBB'} width={'full'} height={'398px'} p={'15px'}
                                    backgroundImage={bannerPreview? bannerPreview : values.banner} backgroundSize={'100%'}
                                    backgroundRepeat={'no-repeat'} justifyContent={'end'}>
                                    <HStack>
                                         <Input disabled={!artistData?.id} ref={bannerRef} hidden type="file" onChange={(e)=>{uploadBanner(e.target.files[0])}}/>
                                        <Button padding={0} size={'sm'} 
                                            colorScheme={'whiteAlpha'}
                                            onClick={() => bannerRef.current.click()}>
                                            <EditIcon />
                                        </Button>
                                    </HStack>
                                </Box>
                        }
                        <Box w={'full'} height={'full'} bg='#99D9D51F'>
                            {!editing['info']?
                                <MDEditor.Markdown 
                                    source={markdownValue}
                                    rehypePlugins={[[rehypeSanitize]]}
                                    />
                            : 
                                <>
                                <Heading>Breve Resumo sobre carreira e habilidades</Heading>
                                <MDEditor
                                    height={'600px'}
                                    id="pageInfo.description"
                                    value={markdownValue}
                                    onChange={setMarkdownValue}
                                    previewOptions={{
                                        rehypePlugins: [[rehypeSanitize]],
                                    }}/>
                                </>
                            }    
                        </Box>
                    </VStack>
                </GridItem>
            </Grid>
            <Box w={'full'} bg='#FDD07A1f' py={'84px'} px={'45px'}>
            {!tramposLoading && trampos?.length > 0?
                    <SliderCarousel trampos={trampos} />
                    : null
                }
            </Box>
           {!reviewError && !reviewsLoading && userReviews?.length > 0? 
            <Flex bgColor={'#00A19521'} width={'full'}
            justifyContent={'center'} alignItems={'start'} px={'11px'} py={'46px'}>
                <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={50}
                slidesPerView={1}
                navigation               
                >
                {
                    userReviews?
                    userReviews.map( 
                            (item, index) => {
                                return(
                                    <SwiperSlide key={`slider${index}`}>
                                        <Center>
                                            <HStack key={index} width={'80%'}>
                                                <VStack w={'200px'}>
                                                    <Avatar key={`avatar${index}`} w={'100px'} h={'100px'} name={item.reviewer} src={item.profilePic} />
                                                    <Text fontSize={'18px'} fontWeight={'bold'}>{item.reviewer}</Text>
                                                    <Flex justifyContent={'space-between'}>
                                                        <Text as={'i'} color={'#615A5A'} fontSize={'12px'} fontWeight={'semibold'}>{item.title}</Text>
                                                    </Flex>                                                     
                                                </VStack>                             
                                                <VStack key={`vstack${index}`} spacing={0} w={'full'}>
                                                    <Box w={'full'}>
                                                        <Text as={'i'} fontSize={'13px'} fontWeight={'light'}>{item.data}</Text>
                                                    </Box>
                                                    <Box w={'full'}>
                                                        <Text fontSize={'16px'}>{item.text}</Text>
                                                    </Box>
                                                </VStack>
                                                {(userData && artistData?.uid === user?.uid) || (item?.reviwerId === userDataContext?.uid)?
                                                <Button onClick={() => deleteComment(userReviews[index])} colorScheme={'red'}><DeleteIcon /></Button>
                                                : null}
                                            </HStack>
                                        </Center>
                                    </SwiperSlide>
                                );
                            } 
                        )
                        : null
                    }
                    </Swiper>
                </Flex>
                : null}
                   
            {userData && values?.uid !== user?.uid?
                <Box p={'30px'} w={'1216px'} minH={'177px'} bgColor={"#C4C4C4"}>
                    <HStack>
                        <VStack w={'200px'}>
                            <Avatar w={'100px'} h={'100px'} name={userDataContext?.userName} src={userDataContext?.profilePic} />
                            <Text fontSize={'18px'} fontWeight={'bold'}>{userDataContext?.userName}</Text>
                            <Flex justifyContent={'space-between'}>
                                <Text as={'i'} color={'#615A5A'} fontSize={'12px'} fontWeight={'semibold'}>{userData.title || 'usuário'}</Text>
                            </Flex>                                                      
                        </VStack>
                        <Textarea
                            variant={'filled'}
                            value={review}
                            w={'776px'} h={'150px'}
                            placeholder="Escreva um comentário sobre o artista..."
                            onChange={(e) => {setReview(e.target.value)}} />
                        <Flex h={'150px'} flexDir={'column-reverse'}>
                            <Button disabled={!review} onClick={submitReview} h={'50px'} w={'150px'} rounded={0} bgColor={'#00A195'}>
                                    Enviar
                            </Button>
                        </Flex>
                    </HStack>
                </Box>
                :
                null }          
      </VStack>
  );
};

export default ArtistPage;


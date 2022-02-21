/* eslint-disable react-hooks/exhaustive-deps */
import {  Avatar, InputGroup, InputLeftAddon, Tooltip, Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Image, Input, Link, ListItem, Skeleton, Text, Textarea, UnorderedList, VStack, Wrap, WrapItem, InputLeftElement, useDisclosure, FormControl, FormErrorMessage } from "@chakra-ui/react";
import MainInfo from "../../MainInfo/MainInfo";
import MainPageCarousel from "../../MainPageCarousel";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db, storage } from "../../../utils/firebase";
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useProdutora } from "../../../hooks/useProdutora";
import { useFormik } from "formik";
import { SocialIcon } from "react-social-icons";
import { AddIcon, DeleteIcon, EditIcon, PhoneIcon } from "@chakra-ui/icons";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper";
import { Swiper, SwiperSlide } from 'swiper/react';
import ImageUploading from 'react-images-uploading';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useUploadFile } from 'react-firebase-hooks/storage';
import { getStorage, storageRef } from 'firebase/storage';
import 'firebase/storage'; 
import { format } from "date-fns";
import InputMask from "react-input-mask";
import EditModal from "../../EditModal";
import * as Yup from 'yup';
import { useProdutoraData } from "../../../hooks/useProdutorasData";
import { useProjectsData, useUserProjectsData } from "../../../hooks/useProjectsData";
import { useUserOportunidadesData } from "../../../hooks/useOportunidadesData";
import { useUserReviews } from "../../../hooks/useReview";
import { useUserData } from "../../../hooks/useUserData";
import { useMutation } from "react-query";
import { nanoid } from "nanoid";
import IdentityContext from "../../../Context/IdentityContext";

const SignupSchema = Yup.object().shape({
    name: Yup.string().max(100, 'Nome muito Longo').required('Nome é obrigatório!'),
    cadastro: Yup.string().required('Data Obrigatória!'),
    contact: Yup.string().required('Dados de contato obrigatório'),
    miniBio: Yup.string().max(350, 'Mini biografia muito longa').required('Mini biografia é obrigatória!'),
    habilidades: Yup.array(Yup.string().required('Forneça até 5 habilidades')).min(1, 'Forneça Tags').max(5, 'Muitas Tags').required('Adicione Habilidades'),
    socialMedia: Yup.array(Yup.string().url('Deve ser um link válido de mídias sociais').required('Adicione até 8 links de media.'))
            .max(8, 'Mais de oito links encontrados')
            .notRequired(),
    title: Yup.string().max(250, 'Título muito longo'),
    url: Yup.string().required('A url é obrigatória na criação'),
  });

const initialData = {
    name: '',
    cadastro: '',
    socialMedia: [],
    miniBio: '',
    habilidades: [],
    url: '',
    contact: '',
    profilePic: '',
    bannerPic: '',
}

const ProdutoraPage = (props) => {
    const {prod} = useParams();
    const [user] = useAuthState(auth);

    const [uri, setUri] = useState(prod);

    const { data: produtoraData, error: produtoraError, isLoading: produtoraLoading, 
        isIdle: produtoraIdle, refetch: refetchProdutora } = useProdutoraData(uri);

    const [produtora, setProdutora] = useState(null);
    const [editing, setEditing] = useState(false);
    const [userDataContext, setUserDataContext] = useContext(IdentityContext);

    useEffect(
        () => {
            if(!prod && user){
                setUri(user.uid);
                setProdutora({...initialData, id: user.uid});
                setEditing(true);
            }
        },[prod, user]
    );

    
    const [notFound, setNotFound] = useState(false);

    useEffect(
        () => {
            if(prod && !produtoraIdle && !produtoraLoading && !produtoraData){
                setNotFound(true);
            } else if (produtoraData) {
                setProdutora(produtoraData);
            }
        }, [produtoraData, produtoraLoading, produtoraIdle, prod]
    );

    const {data: projetosData, isLoading: projetosLoading, refetch: refetchProjetos} = useUserProjectsData(produtora?.id);
    const [projetos, setProjetos] = useState([]);

    useEffect(
        () => {
            if(projetosData){
                setProjetos(projetosData);
            };
        },[projetosData]
    );

    const {data: oportunidadesData, isLoading: oportunidadesLoading} = useUserOportunidadesData(produtora?.id);
    const [oportunidades, setOportunidades] = useState([]);

    useEffect(
        () => {
            if(oportunidadesData){
                setOportunidades(oportunidadesData);
            };
        },[oportunidadesData]
    );

    const { data: userReviews, error: reviewError, isLoading: reviewsLoading, refetch: refetchReviews } = useUserReviews(produtora?.id, 'produtora');
    const [reviews, setReviews] = useState([]);

    useEffect(
        () => {
            if(userReviews){
                setReviews(userReviews);
            };
        },[userReviews]
    );

    const [uid, setUID] = useState(null);
    const { data: userData, error: userError, isLoading: userLoading, } = useUserData(uid);

    useEffect(
        ()=>{
            if(user)
            {
                setUID(user.uid);
            }
        },[user]
    );

    // const [userData, setUserData] = useState(null);

    const navigate = useNavigate();

    const { handleChange, values, setValues, handleSubmit, setFieldValue, errors, isValid } = useFormik({
        validationSchema: SignupSchema,
        initialValues: {
            ...initialData,
        },
        onSubmit: values => {
        //   alert(JSON.stringify(values, null, 2));
        produtoraSubmit();
        },
        enableReinitialize: true,
    });

    useEffect(
        () => {
            if(produtora){
                setValues({...values, ...produtora});
            }
        },[produtora]
    );

    useEffect(
        () => {
            setSocialCount(values?.socialMedia?.length)
            setHabilidadeCount(values?.habilidades?.length)
        },[values]
    );

    function toggleEdit(){
        setEditing(!editing);
    }

    const [socialCount, setSocialCount] = useState(0);
    const [habilidadeCount, setHabilidadeCount] = useState(0);

    function handleSocialBlur(e){
        values.socialMedia = values.socialMedia?.filter((entry) => { return entry.trim() !== ''; });
        setSocialCount(values.socialMedia?.length);
    }

    function handleHabilidadeBlur(e){
        values.habilidades = values.habilidades?.filter((entry) => { return entry.trim() !== ''; });
        setHabilidadeCount(values.habilidades?.length);
    }

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
      }

    const deleteHabilidade = (value) => {
        let cp = [...values.habilidades];
        cp = removeItemOnce(cp, value);
        setFieldValue('habilidades', cp);
    };

    const deleteSocial = (value) => {
        let cp = [...values.socialMedia];
        cp = removeItemOnce(cp, value);
        setFieldValue('socialMedia', cp);
    };

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

    async function uploadProfilePic(callback) {
        if(!image)
        {
            if(callback){
                callback(); 
            }  
            return null;
        }

        const storageRef = ref(storage, 'produtoras-avatar/' + image.name);

        const metadata = {
            contentType: image.type,
        };

        await uploadBytes(storageRef, image, metadata).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                setFieldValue('profilePic', downloadURL);
                values.profilePic = downloadURL;      
                setProfilePreview(null);      
                if(callback){
                    callback();
                }  
              });
          });
    }

    function uploadBannerPic(callback) {
        if(!banner)
        {
            if(callback){
                callback(); 
            }  
            return null;
        }

        const storageRef = ref(storage, 'produtoras-banner/' + banner.name);

        const metadata = {
            contentType: banner.type,
        };

        uploadBytes(storageRef, banner, metadata).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                setFieldValue('bannerPic', downloadURL);
                values.bannerPic = downloadURL;
                console.log(downloadURL);
                setBannerPreview(null);
                if(callback){
                    callback(); 
                }          
              });
          });
    }

    const inputRef = useRef()
    const bannerRef = useRef()

    // async function userSubmit(){
    //     if(!isURLAvailable) { return; }
    //     uploadProfilePic(
    //         uploadBannerPic(
    //             () => {
    //                 const docRef = doc(db, "produtoras", user?.uid);
    //                 setDoc(docRef, {...values});
    //             }
    //         )
    //     );

    //     setEditing(false);
    // }

    const [isURLAvailable , setIsURLAvailable] = useState(true);

    const [review, setReview] = useState('');

    async function getURLAvailable(url){
        const q = query(collection(db, 'produtoras'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || url === produtora?.url;
    }

    function checkForUniqueURL(e){
        getURLAvailable(e.target.value).then(
            (res) => {
                setIsURLAvailable(res);
            }
        )
    }

    function submitReview(){
        if(!review || !userDataContext) { return; }
        const docRef = doc(db, 'reviews', nanoid(21));
        setDoc(docRef, {
            data: format(Date.now(), 'MM/dd/yyyy'),
            owner: produtora.id,
            profilePic: userDataContext.profilePic || 'undefined',
            reviewer: userDataContext.userName,
            reviwerId: userDataContext.uid,
            text: review,
            tipo: 'produtora',
            title: userData.title || 'usuário'
        });
        setReview('');
        refetchReviews();
    }

    const { isOpen, onOpen, onClose } = useDisclosure();

    const profilePicMutation = useMutation(
        (file) => {
            const storageRef = ref(storage, `produtoras-profile/${uid}.${file.name.split('.').pop()}`);

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
            const storageRef = ref(storage, `produtoras-banner/${uid}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue('bannerPic', url);
                        const p = {bannerPic: url};
                        updateFieldMutation.mutate(p);
                    }
                );         
            },
        }
    );

    const updateFieldMutation = useMutation(
        (field) => {
            if(!produtora?.id){ return; }
            const userRef = doc(db, 'produtoras', produtora.id);
            // Set the 'capital' field of the city
            
           return setDoc(userRef, {...field}, { merge: true });
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success ProfilePic');
            },
            onError: (error, variables, context) => {
                // An error happened!
                console.log(variables);
              },
        }
    );

    async function uploadProfile(file){

        if(!produtora?.id) { return; }

        profilePicMutation.mutate(file);
    };

    async function uploadBanner(file){

        if(!produtora?.id) { return; }

        bannerPicMutation.mutate(file);
    };

    const updateProdutora = useMutation(
        () => {
            const id = produtora.id;
            const docRef = doc(db, "produtoras", id);
            setDoc(docRef, {...values});
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Updating Profile');
               refetchProdutora();
            },
        }
    );

    async function produtoraSubmit(){
        if(!isURLAvailable || !produtora?.id) { return; }

        updateProdutora.mutate();
    }

    function closeModal(){
        refetchProjetos();
        setProjeto(null);
        setProjetoId(null);
        onClose();
    };

    function validateURL(link)
    {
        if (link.indexOf("http://") === 0 || link.indexOf("https://") === 0) {
            return link;
        }
        else{
            return `https://${link}`;
        }
    }

    function openEdit(projeto){
        setProjeto(projeto);
        setProjetoId(projeto.id);
        onOpen();
    }

    const [projeto, setProjeto] = useState(null);
    const [projetoId, setProjetoId] = useState(null);

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

    const deleteProjectMutation = useMutation(
        (item) => {
            const id = item.id;
            deleteDoc(doc(db, "projetos", id));
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Deleting Review');
               refetchReviews();
            },
        }
    );

    function deleteProjeto(item){
        deleteProjectMutation.mutate(item);
    }
    
  return(
      <>
        {/* <EditModal isOpen={isOpen} onClose={onClose} owner={ownerID} projeto={null} userGuid={user?.uid}/>   */}
        <EditModal isOpen={isOpen} onClose={closeModal} projeto={projeto} ownerID={projetoId} userGuid={user?.uid}/>  
        <VStack px={'55px'} py={'70px'} width={'full'} spacing={'70px'}>
            <Grid
            width={'full'}
            minHeight='1413px'
            templateRows='repeat(1, 1fr)'
            templateColumns='repeat(5, 1fr)'
            gap={4}
            >
                <GridItem colSpan={2} bg='#FFF9ED' >
                    <VStack py={'40px'} spacing={'30px'}>
                        {produtora?.id === user?.uid  && userData && userData?.userType === 'produtora'? 
                            <Flex w={'full'} justifyContent={'end'} pt={'5px'} px={'20px'}>
                                {!editing?
                                    <Button onClick={toggleEdit}>Editar Produtora</Button>
                                    :
                                    <HStack>
                                        <Center h={'full'}>
                                            <FormControl isInvalid={errors.url || !isURLAvailable}>
                                                <Tooltip label='Escolha uma URL única para sua produtora' placement='bottom' isOpen={!isURLAvailable}>
                                                    <InputGroup size='sm'>
                                                        <InputLeftAddon children='sala33.com.br/produtoras/' />
                                                        <Input isInvalid={!isURLAvailable} onChange={handleChange} onBlur={checkForUniqueURL} 
                                                        variant={'filled'} id='url' placeholder={values?.url} value={values?.url} />
                                                    </InputGroup>
                                                </Tooltip>
                                                <FormErrorMessage>{errors.url || !isURLAvailable}</FormErrorMessage>
                                            </FormControl>
                                        </Center>
                                        <Button onClick={toggleEdit}>Cancelar</Button>
                                        <Button onClick={handleSubmit} disabled={!isValid}>Salvar</Button>
                                    </HStack>
                                }
                            </Flex>
                            : null}
                        {editing || (values?.name && values?.profilePic)?
                            !editing?
                                <Avatar height={'120px'} width={'120px'} name={values?.name} 
                                src={values.profilePic} />
                            :
                            <Tooltip label='500x500' placement='top'>
                                <HStack>
                                    <Avatar height={'120px'} width={'120px'} name={values?.name} src={profilePreview? profilePreview : values?.profilePic} />
                                    <Input ref={inputRef} hidden type="file" onChange={(e)=>{uploadProfile(e.target.files[0])}}/>
                                    <Button padding={0} size={'sm'} colorScheme={'whiteAlpha'} position={'relative'} left={'-65px'} bottom={-30} zIndex={2} onClick={() => inputRef.current.click()}>
                                        <EditIcon />
                                    </Button>
                                </HStack>
                            </Tooltip>
                            :
                            null
                        }
                        <Box>
                            <Center>
                                {editing || values?.name?
                                    !editing?
                                    <Heading fontSize={'30px'}>{values.name}</Heading>
                                    :
                                    <FormControl isInvalid={errors.name}>
                                        <Input onChange={handleChange} variant={'filled'} id='name' placeholder={'Nome da Produtora'} value={values.name} />
                                        <FormErrorMessage>{errors.name}</FormErrorMessage>
                                    </FormControl>
                                :
                                    <Skeleton w={'200px'} h={'40px'}></Skeleton>}                             
                            </Center>
                            <Center><Heading fontSize={'15px'}>Produtora</Heading></Center>
                            <br />
                            {editing || values?.cadastro? 
                                !editing?
                                    <Heading fontSize={'20px'}>Cadastrado em {values?.cadastro}</Heading>
                                    :
                                    <FormControl isInvalid={errors.cadastro}>
                                        <Input onChange={handleChange} variant={'filled'} id='cadastro' placeholder={'Data de Cadastro'} value={values.cadastro} />
                                        <FormErrorMessage>{errors.cadastro}</FormErrorMessage>
                                    </FormControl>
                                :
                                <Skeleton w={'200px'} h={'40px'}></Skeleton>}  
                        </Box>
                        <HStack px={'5px'} mt={'30px'}>
                            {
                                !editing?
                                    values?.socialMedia?.map(
                                        (url, index) => {
                                            return(
                                                <SocialIcon key={index} url={validateURL(url)} style={{ height: 32, width: 32 }}/>
                                            );
                                        }
                                    )
                                :
                                <VStack>
                                    <Heading>Social Media:</Heading>
                                    { values?.socialMedia?.map(
                                        (url, index) => {
                                            return(
                                                <HStack key={`stackSocial-${index}`}>
                                                    <FormControl isInvalid={errors.socialMedia?.length > 0 && errors.socialMedia[index]}>
                                                        <InputGroup size='sm' width={'300px'}>
                                                            <InputLeftAddon children='Link' />
                                                            <Input key={`edit${index}`}
                                                                onChange={handleChange}
                                                                id={`socialMedia[${index}]`}
                                                                variant={'filled'} 
                                                                onBlur={handleSocialBlur}
                                                                placeholder={'Link para mídia social'} value={values.socialMedia[index]} />
                                                        </InputGroup>  
                                                        <FormErrorMessage>{errors.socialMedia?.length > 0 && errors.socialMedia[index]}</FormErrorMessage>
                                                    </FormControl>                                                  
                                                    <Link onClick={() => deleteSocial(url)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                </HStack>
                                            );
                                        }
                                    )}
                                    {editing && values.socialMedia?.length < 10
                                        ?   <Link onClick={() => setFieldValue('socialMedia', [...values.socialMedia, ''])}><AddIcon /></Link> 
                                        :  null 
                                    }
                                </VStack>
                            }        
                        </HStack>
                    </VStack>
                    <VStack spacing={'95px'} pb={'28px'}>
                        <Flex bgColor={'#C4C4C480'} width={'full'} height={'165px'}
                            justifyContent={'center'} alignItems={'center'}>
                                <Center w={'full'} height={'full'}>
                                    <HStack spacing={'86px'}>
                                        <VStack>
                                            <Box w={'94px'} height={'84px'}>
                                                <Button colorScheme={'whiteAlpha'} w={'full'} height={'full'} isDisabled>
                                                    <Heading fontSize={'40px'} color={'black'} fontWeight={'extrabold'}>
                                                        {projetos && projetos.length !== 0? projetos.length : '-'}
                                                    </Heading>
                                                </Button>
                                            </Box>
                                            <Heading fontSize={'25px'} fontWeight={'extrabold'}>Projetos</Heading>
                                        </VStack>
                                        <VStack>
                                            <Box w={'94px'} height={'84px'}>
                                                <Button colorScheme={'whiteAlpha'} w={'full'} height={'full'} isDisabled>
                                                    <Heading fontSize={'40px'} color={'black'} fontWeight={'extrabold'}>
                                                        {oportunidades && oportunidades.length !== 0? oportunidades.length : '-'}
                                                    </Heading>
                                                </Button>
                                            </Box>
                                            <Heading fontSize={'25px'} fontWeight={'extrabold'}>Oportunidades</Heading>
                                        </VStack>
                                    </HStack>  
                                </Center>
                        </Flex>
                        <Flex bgColor={'#C4C4C480'} width={'full'}
                            justifyContent={'center'} alignItems={'center'}>
                            <VStack width={'full'} align={'self-start'} pl={'62px'} pr={'34px'} pt={'26px'} pb={'75px'}>
                                <Heading fontWeight={'extrabold'} fontSize={'25px'}>Bio</Heading>
                                {editing || values?.miniBio? 
                                    !editing?
                                        <Text as={'i'} fontWeight={'bold'} fontSize={'20px'}>{values.miniBio}</Text>
                                    :
                                        <FormControl isInvalid={errors.miniBio}>
                                            <Textarea variant={'filled'} value={values.miniBio} id="miniBio" w={'full'} 
                                                height={'200px'} onChange={handleChange} placeholder={values.miniBio} />                                         
                                            <FormErrorMessage>{errors.miniBio}</FormErrorMessage>
                                        </FormControl>
                                :
                                    <Skeleton w={'200px'} h={'200px'}></Skeleton>}     
                            </VStack> 
                        </Flex>
                        <Flex bgColor={'#C4C4C480'} width={'full'}
                            justifyContent={'center'} alignItems={'center'}>
                                <VStack width={'full'} align={'self-start'} pl={'62px'} pr={'34px'} pt={'26px'} pb={'23px'}
                                spacing={'15px'}>
                                <Heading fontWeight={'extrabold'} fontSize={'25px'}>Habilidades</Heading>
                                    {!editing?
                                        values?.habilidades? 
                                            <UnorderedList>
                                                {values.habilidades?.map(
                                                    (item, index) => {
                                                        return(
                                                            <ListItem key={index}>
                                                                <Text fontSize={'20px'}>{item}</Text>
                                                            </ListItem>
                                                        );
                                                    }
                                                )}
                                            </UnorderedList>
                                            :
                                            <Skeleton w={'200px'} h={'200px'}></Skeleton>
                                        :
                                        <VStack>
                                            {values?.habilidades?.map(
                                                (item, index) => {
                                                    return(
                                                        <HStack key={`stackHabilidade-${index}`}>
                                                            <FormControl isInvalid={errors.habilidades?.length > 0 && errors.habilidades[index]}>
                                                                <Input key={`edit${index}`}
                                                                width={'400px'}
                                                                onChange={handleChange}
                                                                id={`habilidades[${index}]`}
                                                                variant={'filled'} 
                                                                onBlur={handleHabilidadeBlur}
                                                                placeholder={values.habilidades[index]} value={values.habilidades[index]} />
                                                                <FormErrorMessage>{errors.habilidades?.length > 0 && errors.habilidades[index]}</FormErrorMessage>
                                                            </FormControl> 
                                                            <Link onClick={() => deleteHabilidade(item)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                        </HStack>
                                                    );
                                                }
                                            )}
                                            {editing && values.habilidades?.length < 10
                                            ?   <Link onClick={() => setFieldValue('habilidades', [...values.habilidades, ''])}><AddIcon /></Link> 
                                            :  null 
                                        }
                                        </VStack>
                                    }
                                </VStack>
                        </Flex>
                        <Box height={'56px'} width={'164px'}>
                            {!editing?
                                <Button fontSize={'16px'} bg={'#00A195'}
                                width={'164px'} height={'56px'} rounded={0} onClick={
                                    () => {window.location.href = `https://api.whatsapp.com/send/?phone=+55${values?.contact}&text=Olá, encontrei seu contato através da Sala33`}
                                }>Fale Comigo</Button>
                                :
                                <FormControl isInvalid={errors.contact}>
                                    <InputGroup w={'200px'}>
                                        <InputLeftElement
                                        pointerEvents='none'
                                        children={<PhoneIcon color='gray.300' />}
                                            />
                                        <Input
                                        as={InputMask} mask="(**) *****-****" maskChar={null}
                                        onChange={handleChange} variant={'filled'} 
                                        id='contact' placeholder={values?.contact} value={values?.contact} />
                                    </InputGroup> 
                                    <FormErrorMessage>{errors.contact}</FormErrorMessage>
                                </FormControl>                                
                            }
                        </Box>
                    </VStack>
                </GridItem>
                <GridItem colSpan={3} bg='#99D9D51F'>
                    <VStack w={'full'} spacing={'95px'} pb={'28px'}>
                        {editing || values?.bannerPic?
                            
                                <Box bgColor={'#BBBBBB'} width={'full'} height={'398px'} p={'15px'}
                                    backgroundImage={values.bannerPic || 'https://via.placeholder.com/1210x720'} backgroundSize={'cover'}
                                    backgroundRepeat={'no-repeat'} justifyContent={'end'}>
                                    {editing?
                                    <HStack>
                                        <Input ref={bannerRef} hidden type="file" onChange={(e)=>{uploadBanner(e.target.files[0])}}/>
                                        <Button padding={0} size={'sm'} 
                                            colorScheme={'whiteAlpha'}
                                             onClick={() => bannerRef.current.click()}>
                                            <EditIcon />
                                        </Button>
                                    </HStack>
                                    : null}
                                </Box>
                            :
                            <Skeleton width={'full'} height={'398px'}/>
                        }
                        {projetos?.length > 0?
                                <VStack spacing={'33px'} bgColor={'#99D9D538'} width={'full'} minH={'860px'} py={'31px'} px={'30px'}>
                                    <Heading fontSize={'25px'} fontWeight={'extrabold'}>PROJETOS</Heading>
                                        <Wrap spacing={'27px'}>
                                            {projetos?
                                                    projetos.filter(e => (e.preview && e.url)).map(
                                                        (item, index) => {
                                                            return(
                                                                <WrapItem key={index}>
                                                                    <Box w={'350px'} minH={'350px'} bg={'white'}>
                                                                    <Box bgSize={'cover'} bgPosition={'center'} w={'350px'} h={'200px'}
                                                                        bgImage={item.preview} />
                                                                        <VStack w={'full'} spacing={'25px'} p={'25px'}>                                                      
                                                                            <Center width={'full'}>
                                                                                <Heading fontWeight={'bold'} fontSize={'24px'}>{item.name}</Heading>
                                                                            </Center>
                                                                            <Text>
                                                                                {item.apresentacao}
                                                                            </Text>
                                                                            <HStack>
                                                                                <Button disabled={!item.url} onClick={() => navigate(`/projetos/${item.url}`)} h={'50px'} w={'150px'} rounded={0} bgColor={'#00A195'}>
                                                                                        Conheça
                                                                                </Button>
                                                                                {produtora?.id === user?.uid  && userData && userData?.userType === 'produtora'?
                                                                                    <Button disabled={!item.url} onClick={() => openEdit(item)} h={'40px'} w={'30px'} rounded={0} colorScheme={'green'}>
                                                                                        <EditIcon />
                                                                                    </Button>
                                                                                    : null
                                                                                }
                                                                                {produtora?.id === user?.uid  && userData && userData?.userType === 'produtora'?
                                                                                    <Button disabled={!item.url} onClick={() => deleteProjeto(item)} h={'40px'} w={'30px'} rounded={0} colorScheme={'red'}>
                                                                                        <DeleteIcon />
                                                                                    </Button>
                                                                                    : null
                                                                                }
                                                                            </HStack>
                                                                        </VStack>                                                      
                                                                    </Box>
                                                                </WrapItem>
                                                            );
                                                        }
                                                    )
                                                : null}
                                        </Wrap>
                                </VStack>
                                : null
                        }
                        <Flex w={'full'} justifyContent={'end'}>
                            <HStack spacing={'100px'} px={'38px'}>
                            {projetos?.length > 0?
                                <Button h={'50px'} w={'150px'} rounded={0} bgColor={'#00A195'}>
                                        Lista Completa
                                </Button>
                                : null
                            }
                            {produtora?.id === user?.uid? 
                                <Button onClick={onOpen} h={'50px'} w={'150px'} rounded={0} bgColor={'#F05D34'}>
                                    Incluir Projeto
                                </Button>
                                :
                                null
                            }
                            </HStack>
                        </Flex>
                    </VStack>
                </GridItem>
            </Grid>
            {oportunidades?.length > 0?
                <Flex bgColor={'#99D9D5'} width={'full'} height={'470px'}
                justifyContent={'center'} alignItems={'center'}>
                    {oportunidades?
                        <MainPageCarousel cardData={oportunidades} />
                        :
                        null
                    }
                </Flex>:
                null
            }
            {reviews?.length > 0? 
            <Flex bgColor={'#00A19521'} width={'full'}
            justifyContent={'center'} alignItems={'start'} px={'11px'} py={'46px'}>
            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                spaceBetween={50}
                slidesPerView={1}
                navigation               
                onSwiper={(swiper) => console.log(swiper)}
                onSlideChange={() => console.log('slide change')}
                >
                {
                    reviews?
                        reviews.map( 
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
                                                {(userData && produtora?.id === user?.uid) || (item?.reviwerId === userDataContext?.uid)?
                                                <Button onClick={() => deleteComment(reviews[index])} colorScheme={'red'}><DeleteIcon /></Button>
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
                : null
            }        
            {userData && produtora?.id !== user?.uid?
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
                            w={'776px'} h={'150px'}
                            placeholder="Escreva um comentário sobre a produtora..."
                            value={review}
                            onChange={(e) => {setReview(e.target.value)}} />
                        <Flex h={'150px'} flexDir={'column-reverse'}>
                            <Button disabled={!review} onClick={submitReview} h={'50px'} w={'150px'} rounded={0} bgColor={'#00A195'}>
                                    Enviar
                            </Button>
                        </Flex>
                    </HStack>
                </Box>
                :
                null
            }

      </VStack>
      </>
  );
};

export default ProdutoraPage;


import { AspectRatio, Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, Image, Input, InputGroup, InputLeftAddon, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Skeleton, Spacer, Stack, Text, Textarea, Tooltip, useDisclosure, VStack, Wrap, WrapItem } from "@chakra-ui/react"
import { useNavigate, useParams } from "react-router-dom";
import SimpleCarousel from "../../SimpleCarousel/SimpleCarousel";
import styles from 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Carousel } from 'react-responsive-carousel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import colibriRegua from './Images/regua-colibri-apresenta.png'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { auth, db, storage } from "../../../utils/firebase";
import { forwardRef, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useFormik } from "formik";
import CreatableSelect from 'react-select/creatable';
import { ActionMeta, OnChangeValue } from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import ImageUploader from 'react-images-upload';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { nanoid } from "nanoid";
import { useAuthState } from "react-firebase-hooks/auth";
import EditModal from "../../EditModal";
import { useProjectsData } from "../../../hooks/useProjectsData";


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
        {data?.map((v, index) => (
          <YoutubeSlide
            url={v}
            muted
            playing={false}
            key={index}
          />
        ))}
       </Carousel>
    );
   };

const ProjetoDescPage = (props) => {
    const { projeto } = useParams();

    const [current, setCurrent] = useState(null);
    const [ownerID, setOwnerID] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const [user] = useAuthState(auth);

    async function getProjectData(url){
        const q = query(collection(db, 'projetos'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setOwnerID(doc.id);
                setCurrent(doc.data());
                // console.log(doc.id, " => ", doc.data());
                });
        } else {
            //See if it was passed the id
            const docRef = doc(db, "projetos", url);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setOwnerID(url);
                setCurrent(docSnap.data());
            }
        }
    };

    useEffect(() => {
        if(projeto){
            getProjectData(projeto)
        }
    }, [projeto]);

    function closeModal(values){
        if(values){
            if(projeto && values.url && values.url !== projeto){
                navigate(`/projetos/${values.url}`)
            }
            else{
                setCurrent(values)
            }
        }
        getProjectData(projeto);
        onClose();
    };

    const external = (route) =>{
        if(route) {
            window.location.href = route;
        }
    };

  return(
    <VStack width={'full'} px={{base:0, md:'100px'}} py={'28px'} spacing={'40px'}>
        {current && current?.owner === user?.uid? <Button onClick={onOpen}>Editar Projeto</Button> : null}      
        <EditModal isOpen={isOpen} onClose={closeModal} ownerID={ownerID} projeto={current}/>
        <Box width={'full'} height={'80px'}>
            <Center width={'full'} height={'full'}>
                {current?
                    <Heading>
                        {current.name}
                    </Heading>
                    :
                    <Skeleton height={'42px'} width={'600px'} />
                }
            </Center>
        </Box>
        {current?.main?
            <Box w={'full'}>
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={50}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    onSwiper={(swiper) => console.log(swiper)}
                    onSlideChange={() => console.log('slide change')}
                    >
                    {current.main?.map(
                        (item, index) => {
                            return(
                                <SwiperSlide key={index}>
                                    <Center>
                                    <Image h={'560px'} src={item} />
                                    </Center>
                                </SwiperSlide>
                            );
                        }
                    )}
                </Swiper>
            </Box>
        : null
        }
        <HStack w={'full'}>          
            {current?.externalLink?
                <>
                    <Spacer />
                        <Box height={'56px'} width={'164px'}>
                        <Button fontSize={'16px'} bg={'gray.900'}
                            onClick={() => {external(current.externalLink)}} width={'full'} height={'full'} rounded={0}>Site do Projeto</Button>
                    </Box>
                </>
                : null}
            {current?.contact?
                <>
                    <Spacer />
                    <Box height={'56px'} width={'164px'}>
                        <Button fontSize={'16px'} bg={'gray.900'}
                            onClick={() => {external(`https://api.whatsapp.com/send/?phone=+55${current?.contact}&text=Olá, encontrei seu contato através da Sala33`)}} 
                            width={'full'} height={'full'} rounded={0}>Contato</Button>
                    </Box>
                </>
                : null}
            <Spacer />
        </HStack>
        <Box width={'full'} minH={'350px'} px={'10px'} py={'13px'}>
            <VStack w={'full'}>
                <Box w={'full'}>
                    {current?
                        <Heading fontSize={'24px'} fontWeight={700}>
                            {current.sinopseTitle}
                        </Heading>
                        : <Skeleton w={'90%'} height={'30px'} /> }
                </Box>
                <Box w={'full'}>
                    {current?
                        <Text as={'div'} dangerouslySetInnerHTML={{ __html: current.sinopse}}
                            fontWeight={400} fontSize={'22px'} color={'black'} />
                        : <Skeleton w={'90%'} height={'30px'} /> }
                </Box>
            </VStack>
        </Box>
        <VStack width={'full'} spacing={'40px'}>
            <Center>
                <Heading>Ficha Técnica</Heading>
            </Center>
            <Center>
                <Grid
                    h='full'
                    templateRows='repeat(2, 1fr)'
                    templateColumns='repeat(1, 1fr)'
                    gap={0}
                    >
                {current?
                        current.ficha?.map(
                            (item, index) => {
                                return(
                                    <GridItem key={index} gap={0}>
                                        <HStack spacing={0}>
                                            <Text fontWeight={'bold'} fontSize={'20px'} key={index}>{item.cargo}:&nbsp;</Text>
                                            {item.participantes?.map(
                                                (participantes, z) => {
                                                    return(
                                                        <Text key={`${z}part`} fontSize={'20px'}>{participantes.label}
                                                        {(item.participantes.length - 1) === z? '.' : ',' } &nbsp;</Text>
                                                    );
                                                }
                                            )}
                                        </HStack>
                                    </GridItem >
                                );
                            }
                        ): null
                    }
                </Grid>
            </Center>
        </VStack>
        {current?.media && current.media.length > 0?
            <Box
                width={'full'}
                minHeight={'315px'}
                bgRepeat={'no-repeat'}
                bgPos={'right top'}>
                <CarouselVideo data={current.media} />
            </Box>
            : null
        }
        {current?.imprensa?
            <VStack
                spacing={'45px'}
                width={'full'}
                minHeight={'315px'}
                bgRepeat={'no-repeat'}
                bgPos={'right top'}>
                    <Center>
                        <Heading fontWeight={'extrabold'} fontSize={'25px'}>IMPRENSA</Heading>
                    </Center>
                    <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                    {current.imprensa.filter(e => (e.title && e.jornal)).map(
                        (item, index) => {
                            return(
                            <GridItem key={index}>
                                <HStack>
                                    {item.pic?
                                        <Box bgRepeat={'no-repeat'} bgImage={item.pic} bgSize={'contain'} bgPos={'center'} w={'150px'} h={'100px'} />
                                        : null
                                    }
                                    {item.pic?
                                        <Box w={'2px'} h={'80px'} bgColor={'black'} />
                                        : null
                                    }
                                    <VStack px={'17px'} align={'start'}>
                                        <Link href={item.url} isExternal><Text fontSize={'18px'} fontWeight={'bold'}>{item.title}</Text></Link>
                                        <Text as={'i'} fontWeight={'light'} fontSize={'13px'}>{item.data}</Text>
                                        <Text fontSize={'18px'}>{item.jornal}</Text>
                                    </VStack>
                                </HStack>
                            </GridItem>
                            );
                        }
                    )}
                    </Grid>
            </VStack>
            : null
        }
        <Center>
            <Heading fontWeight={'extrabold'} fontSize={'25px'}>EXECUÇÃO</Heading>
        </Center>
        {current?.apoiadores?
            <Flex width={'full'}
            minH={'150px'} alignContent={'center'} justifyContent={'space-evenly'} p={'7px'}>
                    {current.apoiadores.map(
                        (item, index) => {
                            return(
                                <Image  maxH={'126px'}  src={item} key={index} />
                            );
                        }
                    )}
            </Flex>
                : null
        }
        <Center>
            <Heading fontWeight={'extrabold'} fontSize={'25px'}>FINANCIADORES</Heading>
        </Center>
        {current?.regua?
            <Flex width={'full'}
            minH={'150px'} alignContent={'center'} justifyContent={'space-evenly'} p={'7px'}>
                    <Image  maxH={'126px'}  src={current.regua} />
            </Flex>
                : null
        }
    </VStack>
  );
};

export default ProjetoDescPage;

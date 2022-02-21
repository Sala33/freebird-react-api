import { DeleteIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Center, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { useState } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import IdentityContext from "../../Context/IdentityContext";
import { useUsersData } from "../../hooks/useUserData";
import { db } from "../../utils/firebase";
import OportunidadeCard from "../Content/OportunidadeCard";

const TrampoCard = ({item}) => {
    const navigate = useNavigate();
    const {data, isLoading} = useUsersData();
    const [userDataContext, setUserDataContext] = useContext(IdentityContext);

    function getUserName(id){
        const cp = [...data];
        const filter = cp.filter(user => user.uid === id);
        if(filter.length > 0){
            return filter[0].name;
        }
        else{
            return 'Artista';
        }
    }

    const deleteTrampoMutation = useMutation(
        (id) => {
            deleteDoc(doc(db, "trampos", id));
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Deleting Trampo');
            },
        }
    );

    function deleteTrampo(id){
        deleteTrampoMutation.mutate(id);
    }

    return(
        <Box w={'270px'} height={'360px'}>
            <Box bg={'white'} w={'full'} h={'full'} pb={'18px'}>
                <Flex direction={'column'} h={'full'} justifyContent={'space-around'}>
                    <Box bgRepeat={'no-repeat'} 
                        h={'180px'} w={'full'} bgSize={'contain'} bgPosition={'center'} bgImage={item.pic} />
                    <Center>
                        <Heading fontSize={'18px'}>{item.title}</Heading>
                    </Center>
                    {!isLoading?
                        <Center>
                            <Text fontWeight={'bold'} fontStyle={'13px'} >por: <Text as={'span'} color={'#2B87BB'}>{getUserName(item.owner)}</Text></Text>
                        </Center>
                    : null}
                    <Center>
                        <Text as={'i'} fontSize={'13px'} color={'#28A01E'}>{item.orçamento}</Text>
                    </Center>
                    <Box>
                        <Center>
                            <Badge color={'gray'}>
                                {item.categoria}
                            </Badge>
                        </Center>
                    </Box>
                    <Center>
                        <HStack>
                            <Button w={'150px'} h={'50px'} bgColor={'#00A195'} rounded={0} onClick={() => navigate(`/trampos/${item.url}`)}>Sobre a vaga</Button>
                            {(item?.owner === userDataContext?.uid)?
                            <Button size={'sm'} onClick={() => deleteTrampo(item.id)} colorScheme={'red'}><DeleteIcon /></Button>
                            : null}    
                        </HStack>
                    </Center>
            
                </Flex>
            </Box>
        </Box>  
    );
}

const SliderCarousel = (props) => 
{
    const { trampos, oportunidades } = props;
    const cardData = trampos || oportunidades;
    // const teste = [ {m:' '}, {m:' '}, {m:' '}, {m:' '}]
    // console.log(trampos);

    const [users, setUsers] = useState([]);

    async function getUserData(){
        const querySnapshot = await getDocs(collection(db, "users"));
        let userList = [];
        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        userList.push(doc.data());
        });
        setUsers(userList);
    }

    useEffect(
        () => {
            if(trampos && users.length === 0){
                console.log('here');
                getUserData();
            }
        },[trampos, users]
    );

    function getUserName(id){
        const cp = [...users];
        const filter = cp.filter(user => user.uid === id);
        if(filter.length > 0){
            return filter[0].name;
        }
        else{
            return 'Artista';
        }
    }

    return (
        cardData.length > 0? 
            <Box w={'full'} px={'10px'}>
                    <Swiper
                        spaceBetween={50}
                        slidesPerView={3}
                        // onSlideChange={() => console.log('slide change')}
                        // onSwiper={(swiper) => console.log(swiper)}
                        >
                        {cardData.map(
                            (item, index) => (
                                <SwiperSlide  key={index}>
                                    {trampos?
                                        <TrampoCard item={item} getUserName={getUserName} />
                                        :
                                        <OportunidadeCard item={item} />
                                    }
                                </SwiperSlide>
                        ))
                        }                        
                    </Swiper>
          </Box>
         : null
      ); 
}

export default SliderCarousel;
export {TrampoCard};
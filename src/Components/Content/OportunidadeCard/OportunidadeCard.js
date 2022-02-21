import { Badge, Box, Button, Center, Flex, Heading, Image, Link, Text, VStack } from "@chakra-ui/react";
import { Link as ReachLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

const OportunidadeCard = ({item}) => {
    const navigate = useNavigate();
    return(
        <Box w={'270px'} minH={'380px'}>
            <Box bg={'white'} w={'full'} h={'full'} pb={'18px'}>
                <Flex flexDir={'column'} h={'full'} spacing={'20px'} justifyContent={'space-around'}>
                    <Box bgRepeat={'no-repeat'} 
                        h={'180px'} w={'full'} bgSize={'contain'} bgPosition={'center'} bgImage={item.pic} />
                    <VStack spacing={0}>
                        <br />
                        <Center>
                            <Heading fontSize={'18px'}>{item.Title}</Heading>
                        </Center>
                        <Center maxW={'80%'}>
                            <Text fontWeight={'bold'} fontStyle={'13px'} >para o projeto:
                                <Link as={ReachLink} to={`/projetos/${item.ownerProj.id}`}>
                                    <Text as={'span'} color={'#2B87BB'}> {item.ownerProj.name}</Text>
                                </Link>  
                            </Text>
                        </Center>
                        <Center>
                            <Text as={'i'} fontSize={'13px'} color={'#28A01E'}>{item.orcamento}</Text>
                        </Center>
                        <Box>
                            <Center>
                                <Badge color={'gray'}>
                                    {item.categoria}
                                </Badge>
                            </Center>
                        </Box>
                    </VStack>
                    <br />
                    <Center>
                        <Button w={'200px'} h={'50px'} bgColor={'#00A195'} rounded={0} onClick={() => navigate(`/oportunidades/${item.url}`)}>Sobre a Oportunidade</Button>
                    </Center> 
                </Flex>
            </Box>
        </Box>  
    );
}

export default OportunidadeCard;
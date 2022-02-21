import { Box, Button, Flex, Heading, HStack, Image, Skeleton, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ProdutoraBox = (props) => {
    const navigate = useNavigate(); 
    const routeChange = (route) =>{
        if(route) {
            navigate(`/projetos/${route}`);
        }
    };
    const external = (route) =>{
        if(route) {
            window.location.href = route;
        }
    };
    const oportunidade = () =>{
        navigate('/oportunidades/criar-oportunidade');
    };

    const src = props.preview || 'https://via.placeholder.com/150';

    return(
        <Box minHeight={'300px'} width={'full'} px={{base:0, md:'50px'}}>
            <HStack py={'25px'} spacing={'20px'}>
                <Box w={'350px'} h={'250px'} bgImage={src} backgroundSize={'contain'} backgroundPosition={'center'} backgroundRepeat={'no-repeat'} />
                <VStack py={'13px'} width={'full'} alignItems={'start'} spacing={'11px'}>
                    <Box>
                        <Heading fontSize={'20px'}>{props.name}</Heading>
                        <Text fontSize={'14px'}>{props.data}</Text>
                    </Box>
                    <Box px={'8px'} pt={'8px'} pb={'23px'} h={'111px'} width={'full'}
                        justifyContent={'center'} alignItems={'center'} whiteSpace={'normal'} overflow={'hidden'} textOverflow={'ellipsis'}>
                        <Text as={'div'} dangerouslySetInnerHTML={{ __html: props.apresentacao}} fontWeight={400} fontSize={'14px'} color={'black'}></Text>
                    </Box>
                    <Wrap spacing={'24px'}>
                        {props.link?
                            <WrapItem>
                                <Box height={'56px'} width={'164px'}>
                                    <Button fontSize={'16px'} bg={'#F05D34'}
                                    width={'full'} height={'full'}
                                    rounded={0}
                                    onClick={() => external(props.link)}>
                                        Conheça
                                    </Button>
                                </Box>
                            </WrapItem>
                        : null}
                        <WrapItem>
                            <Box height={'56px'} width={'164px'}>
                                <Button fontSize={'16px'} bg={'#F05D34'}
                                width={'full'} height={'full'}
                                rounded={0}
                                onClick={() => routeChange(props.url)}>
                                    Mais informações
                                </Button>
                            </Box>
                        </WrapItem>
                        {props.owner && props.user?.uid === props.owner?
                            <WrapItem>
                                <Box height={'56px'} width={'164px'}>
                                    <Button fontSize={'16px'} bg={'#F05D34'} 
                                        width={'full'} height={'full'} rounded={0}
                                        onClick={oportunidade}
                                        >Criar Oportunidades</Button>
                                </Box>
                            </WrapItem>  
                            :null
                        }                      
                    </Wrap>
                </VStack>
            </HStack>
        </Box>
    );
}

const ProdutoraListItem = (props) => {
    const navigate = useNavigate(); 
    const routeChange = (route) =>{
        if(route) {
            navigate(`/produtoras/${route}`);
        }
    };

    const navigateToSearch = (owner, route) => {
        if(owner && route) {
            navigate(`/${route}?owner=${owner}`);
        }
    }

    const external = (route) =>{
        if(route) {
            window.location.href = route;
        }
    };
    const oportunidade = () =>{
        navigate('/oportunidades/criar-oportunidade');
    };

    return(
        <Box minHeight={'300px'} width={'full'} px={{base:0, md:'50px'}}>
            <HStack py={'25px'} spacing={'20px'}>
                <Box w={'446px'} h={'250px'} bgImage={props.bannerPic} backgroundSize={'cover'} backgroundPosition={'center'} backgroundRepeat={'no-repeat'} />
                <VStack py={'13px'} width={'full'} alignItems={'start'} spacing={'11px'}>
                    <Box>
                        <Heading fontSize={'20px'}>{props.name}</Heading>
                        <Text fontSize={'14px'}>{props.cadastro}</Text>
                    </Box>
                    <Box px={'8px'} pt={'8px'} pb={'23px'} h={'111px'} width={'full'}
                        justifyContent={'center'} alignItems={'center'} whiteSpace={'normal'} overflow={'hidden'} textOverflow={'ellipsis'}>
                        <Text as={'div'} dangerouslySetInnerHTML={{ __html: props.miniBio}} fontWeight={400} fontSize={'14px'} color={'black'}></Text>
                    </Box>
                    <Wrap spacing={'24px'}>
                        <WrapItem>
                            <Box height={'56px'} width={'164px'}>
                                <Button fontSize={'16px'} bg={'#00A195'}
                                width={'full'} height={'full'}
                                rounded={0}
                                onClick={() => routeChange(props.url)}>
                                    Mais informações
                                </Button>
                            </Box>
                        </WrapItem>                     
                        <WrapItem>
                            <Box height={'56px'} width={'164px'}>
                                <Button fontSize={'16px'} bg={'#00A195'}
                                width={'full'} height={'full'}
                                rounded={0}
                                onClick={() => navigateToSearch(props.owner, 'oportunidades')}>
                                    Oportunidades
                                </Button>
                            </Box>
                        </WrapItem>                     
                        <WrapItem>
                            <Box height={'56px'} width={'164px'}>
                                <Button fontSize={'16px'} bg={'#00A195'}
                                width={'full'} height={'full'}
                                rounded={0}
                                onClick={() => navigateToSearch(props.owner, 'projetos')}>
                                    Projetos
                                </Button>
                            </Box>
                        </WrapItem>                     
                        <WrapItem>
                            <Box height={'56px'} width={'164px'}>
                                <Button fontSize={'16px'} bg={'#00A195'}
                                width={'full'} height={'full'}
                                rounded={0}
                                onClick={() => navigateToSearch(props.owner, 'projetos')}>
                                    Fale Comigo
                                </Button>
                            </Box>
                        </WrapItem>                     
                    </Wrap>
                </VStack>
            </HStack>
        </Box>
    );
}

export default ProdutoraBox;
export { ProdutoraListItem }

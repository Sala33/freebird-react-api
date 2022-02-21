import { Avatar, Box, Button, Center, Flex, Grid, GridItem, Heading, HStack, VStack } from "@chakra-ui/react";
import { SocialIcon } from "react-social-icons";

const MainInfo = (props) => {
  return(
        <Grid
        width={'full'}
        minHeight='1413px'
        templateRows='repeat(1, 1fr)'
        templateColumns='repeat(5, 1fr)'
        gap={4}
        >
            <GridItem colSpan={2} bg='#C4C4C4' >
                <VStack py={'40px'} spacing={'30px'}>
                        <Avatar height={'120px'} width={'120px'} name='Kola Tioluwani' />
                        <Box>
                            <Center>
                                <Heading fontSize={'30px'}>{props.name}</Heading>
                            </Center>
                            <Heading fontSize={'20px'}>{props.affiliation}</Heading>
                        </Box>
                        <HStack px={'5px'} mt={'30px'} bgColor={'#BBBBBB'}>
                            {
                                props.socialMedia?.map(
                                    (url, index) => {
                                        return(
                                            <SocialIcon key={index} url={url} style={{ height: 32, width: 32 }}/>
                                        );
                                    }
                                )
                            }        
                        </HStack>
                    </VStack>
                <VStack spacing={'95px'} pb={'28px'}>
                    <Flex bgColor={'#BBBBBB'} width={'full'} height={'165px'}
                        justifyContent={'center'} alignItems={'center'}>
                        <Heading>Status</Heading>
                    </Flex>
                    <Flex bgColor={'#BBBBBB'} width={'full'} height={'235px'}
                        justifyContent={'center'} alignItems={'center'}>
                        <Heading>Mini Biografia</Heading>
                    </Flex>
                    <Flex bgColor={'#BBBBBB'} width={'full'} height={'235px'}
                        justifyContent={'center'} alignItems={'center'}>
                        <Heading>Segmentos de Atuação</Heading>
                    </Flex>
                    <Box height={'56px'} width={'164px'}>
                        <Button fontSize={'16px'} bg={'gray.900'}
                        width={'full'} height={'full'} rounded={0}>Mais informações</Button>
                    </Box>
                </VStack>
            </GridItem>
            <GridItem colSpan={3} bg='#C4C4C4'>
                <VStack spacing={'95px'} pb={'28px'}>
                    <Flex bgColor={'#BBBBBB'} width={'full'} height={'398px'}
                            justifyContent={'center'} alignItems={'center'}>
                            <Heading>Segmentos de Atuação</Heading>
                    </Flex>
                    <Flex bgColor={'#BBBBBB'} width={'full'} height={'860px'}
                            justifyContent={'center'} alignItems={'center'}>
                            <Heading>Projetos</Heading>
                    </Flex>
                </VStack>
            </GridItem>
        </Grid>
  );
};

export default MainInfo;

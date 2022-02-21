import { Center, Container, Flex, Heading, Stack, useBreakpointValue, VStack } from "@chakra-ui/react";

const LargeBanner = (props) => {
    const mobileHeadingCenter = useBreakpointValue({base: 0, md: 100});
    return(
        <Container maxWidth="container.3xl" p={0} margin={0} bg={"brand.300"} 
        backgroundImage={props.bgImage? props.bgImage : null} 
        backgroundSize={'cover'} 
        backgroundPosition="center" 
        backgroundRepeat="no-repeat">
            <Stack width={'100%'} height={'100%'} bg={props.bgImage? "rgba(147, 40, 200, 0.21)" : null}>
                <Flex direction={{ base:'column-reverse', md:'row'}}>
                    <VStack w="full" h="full" p={props.headerPaging ? props.headerPaging : mobileHeadingCenter} spacing={10} alignItems="stretch" >
                            {props.headerTitle ? 
                            <Center>
                                <Heading color={"brand.600"} fontWeight={"semibold"} fontSize={props.headerFont? props.headerFont : "6xl"}>{props.headerTitle}</Heading>
                            </Center> 
                            : props.children 
                            }                   
                    </VStack>
                </Flex>
            </Stack>
        </Container>
    );
};
export default LargeBanner;
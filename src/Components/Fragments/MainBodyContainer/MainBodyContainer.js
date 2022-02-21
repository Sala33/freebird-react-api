import { Container, Flex, useBreakpointValue, VStack } from "@chakra-ui/react"

const MainBodyContainer = (props) => {
    const mobileMainPaging = useBreakpointValue({base: 3, md: 10});
    return(
        <Container maxWidth="container.xl" p={0}>
            <Flex direction={{ base:'column-reverse', md:'row'}}>
                <VStack w="full" h="full" p={mobileMainPaging} spacing={10} alignItems="flex-start">
                    <VStack spacing={props.rowSpacing? props.rowSpacing : 10} alignItems={"stretch"} w={"full"}>
                        {props.children}
                    </VStack>
                </VStack>
            </Flex>
        </Container>
    );
}

export default MainBodyContainer;
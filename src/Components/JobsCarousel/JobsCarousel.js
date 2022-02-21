import customTheme from "../../themes";
import {
  ChakraProvider,
  extendTheme,
  Container,
  Flex,
} from "@chakra-ui/react";
import ChakraCarousel from "../ChakraCarousel/ChakraCarousel";
import JobCard from "../JobCard";

function JobsCarousel(props) {
  return (
    <ChakraProvider theme={extendTheme(customTheme)}>
      <Container
        py={8}
        px={{ base: 0, md: 24 }}
        maxW={{
          base: "100%",
          sm: "35rem",
          md: "43.75rem",
          lg: "57.5rem",
          xl: "75rem",
          xxl: "87.5rem"
        }}
      >
        <ChakraCarousel gap={32}>
          {props.jobList?.map((item, index) => (
            <Flex
              key={index}
              boxShadow="rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
              justifyContent="space-between"
              flexDirection="column"
              overflow="hidden"
              color="gray.300"
              bg="base.d100"
              rounded={5}
              flex={1}
              p={5}
            >
              <JobCard {...item} />
            </Flex>
          ))}
        </ChakraCarousel>
      </Container>
    </ChakraProvider>
  );
}

export default JobsCarousel;
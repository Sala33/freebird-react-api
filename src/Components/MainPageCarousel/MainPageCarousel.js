import customTheme from "../../themes";
import {
  ChakraProvider,
  extendTheme,
  Container,
  Box,
} from "@chakra-ui/react";
import ChakraCarousel from "../ChakraCarousel";
import NewGigCard from "../NewGigCard/NewGigCard";


const artistGigs = [
  {
    name: 'Nome do Artista',
    title: 'Título do Trampo',
    rating: 5,
    link: 'id',
    commentNum: 20
  },
  {
    name: 'Nome do Artista',
    title: 'Título do Trampo',
    rating: 5,
    link: 'id',
    commentNum: 20
  },
  {
    name: 'Nome do Artista',
    title: 'Título do Trampo',
    rating: 5,
    link: 'id',
    commentNum: 20
  },
];

function MainPageCarousel(props) {

  const { cardData } = props;

  return (
    <ChakraProvider theme={extendTheme(customTheme)}>
      <Container
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
          {cardData?.map((item, index) => (
            <Box
            key={index}
            bgColor={'#BBBBBB'}
            width={'268px'}
            height={'360px'}>
                <NewGigCard key={index} {...item} />
            </Box>
          ))}
        </ChakraCarousel>
      </Container>
    </ChakraProvider>
  );
}

export default MainPageCarousel;
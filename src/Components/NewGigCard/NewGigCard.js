import { Box, Button, Center, Flex, Heading, HStack, Image, Text, VStack } from "@chakra-ui/react";
import ReactStars from "react-rating-stars-component";
import { useNavigate } from "react-router-dom";
import fallback from "./Images/FallbackImage.PNG"

const NewGigCard = (props) => {
  const navigate = useNavigate(); 
  const routeChange = (route) =>{
      if(route) {
          navigate(route);
      }
  };
  return(
    <VStack pb={'20px'}>
        <Image width={'268px'} height={'175px'} src='gibbresh.png' fallbackSrc={fallback} />
        <VStack spacing={'5px'}>
            <Center>
                <Flex maxWidth={'95px'} maxHeight={'50px'} justifyItems={'center'} alignContent={'center'}>
                <Heading fontSize={'18px'}>
                    {props.title}
                </Heading>
                </Flex>
            </Center>
            <Text fontSize={'13px'} fontWeight={'bold'}>por "{props.name}"</Text>
        </VStack>
        <HStack>
            <ReactStars
                count={5}
                size={20}
                value={props.rating}
                edit={false}
                activeColor="#ffd700"
                />
                <Text fontSize={'13px'}>{props.commentNum} comentarios</Text>
        </HStack>
        <Box height={'56px'} width={'164px'}>
          <Button fontSize={'16px'} bg={'gray.900'}
          width={'full'} height={'full'} rounded={0}
          onClick={() => routeChange(props.url)}>Conhecer</Button>
        </Box>
    </VStack> 
  );
};

export default NewGigCard;


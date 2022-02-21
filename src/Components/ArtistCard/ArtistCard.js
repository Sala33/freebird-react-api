import {
    Heading,
    Avatar,
    Box,
    Center,
    Text,
    Stack,
    Button,
    Badge,
    useColorModeValue,
    Link,
  } from '@chakra-ui/react';
  import { Link as ReachLink } from 'react-router-dom';
  
 const ArtistCard = (props) => {
   console.log(props);
    const tagColor = useColorModeValue('gray.50', 'gray.800')
    return (
      <Center py={6}>
        <Box
          maxW={'320px'}
          w={'full'}
          bg={useColorModeValue('white', 'gray.900')}
          boxShadow={'2xl'}
          rounded={'lg'}
          p={6}
          textAlign={'center'}>
          <Avatar
            size={'xl'}
            src={
              props.avatarSrc
            }
            alt={'Avatar Alt'}
            mb={4}
            pos={'relative'}
          />
          <Heading fontSize={'2xl'} fontFamily={'body'}>
            {props.name}
          </Heading>
          <Text fontWeight={600} color={'gray.500'} mb={4}>
            {props.pageLink}
          </Text>
          <Text
            textAlign={'center'}
            color={useColorModeValue('gray.700', 'gray.400')}
            px={3}>
            {props.smallDescription}
          </Text>
            
          <Stack overflow={'hidden'} align={'center'} justify={'center'} direction={'row'} mt={6}>
            {props.profissionalTags.split(',')?.slice(0, 2).map((item, integer) => {
              return(
                <Badge
                  key={integer}
                  px={2}
                  py={1}
                  bg={tagColor}
                  fontWeight={'400'}>
                  #{item}
                </Badge>
              );
            })}
          </Stack>
  
          <Stack mt={8} direction={'row'} spacing={4}>
            {/* <Button
              flex={1}
              fontSize={'sm'}
              rounded={'full'}
              _focus={{
                bg: 'gray.200',
              }}>
              Message
            </Button> */}
            <Button
              flex={1}
              fontSize={'sm'}
              rounded={'full'}
              bg={'blue.400'}
              color={'white'}
              boxShadow={
                '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
              }
              _hover={{
                bg: 'blue.500',
              }}
              _focus={{
                bg: 'blue.500',
              }}>
              <Link as={ReachLink} to={`/user/${props.id}`} >Perfil </Link>
            </Button>
          </Stack>
        </Box>
      </Center>    
    );
  };

  export default ArtistCard;
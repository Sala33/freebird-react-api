import {
  Box,
  Center,
  Heading,
  Text,
  Stack,
  Avatar,
  useColorModeValue,
  Image,
  Flex,
  Button
} from '@chakra-ui/react';

const getDate = (date) => {
  return new Date(Date.parse(date));
}

const JobCard = (props) => {
  return (
    <Center py={6}>
      <Box
        maxW={'445px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.900')}
        boxShadow={'2xl'}
        rounded={'md'}
        p={6}
        overflow={'hidden'}>
        <Box
          h={'210px'}
          bg={'gray.100'}
          mt={-6}
          mx={-6}
          mb={6}
          pos={'relative'}>
          <Image
            src={
              props.imageSource
            }
            layout={'fill'}
          />
        </Box>
        <Stack overflow={"hidden"} pt={props.topPadding? props.topPadding : 10}>
          <Text
            color={'brand.500'}
            textTransform={'uppercase'}
            fontWeight={800}
            fontSize={'sm'}
            letterSpacing={1.1}>
            {props.tags}
          </Text>
          <Heading
            color={useColorModeValue('brand.700', 'white')}
            fontSize={'2xl'}
            fontFamily={'body'}>
            {props.title}
          </Heading>
          <Text color={'gray.500'}>
            {props.smallDescription}
          </Text>
        </Stack>
        <Flex width={'full'} justifyContent={'flex-end'} pt={props.pricePadding? props.pricePadding : 0}>
            <Text fontSize={'lg'} px={2} py={1}>R$</Text><Text fontSize={'3xl'} color={'brand.500'}>{props.price}</Text>
        </Flex>
        <Stack mt={6} direction={'row'} spacing={4} align={'center'}>
          <Avatar
            src={props.avatarSrc}
            alt={'Author'}
          />
          <Stack direction={'column'} spacing={0} fontSize={'sm'}>
            <Text fontWeight={600}>{props.authorName}</Text>
            <Text color={'gray.500'}>{getDate(props.postDate).toLocaleDateString()}</Text>
          </Stack>
        </Stack>
        <Flex pt={5} width={'full'} justifyContent={'flex-end'}>
            <Button>Contrate</Button>
        </Flex>
      </Box>
    </Center>
  );
}

export default JobCard;
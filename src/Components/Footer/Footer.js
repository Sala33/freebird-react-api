import {
    Box,
    Container,
    Link,
    SimpleGrid,
    Stack,
    Text,
    Input,
    IconButton,
    useColorModeValue,
    Fade,
    HStack,
    Heading,
    Center,
    VStack,
    InputGroup,
    InputRightAddon,
    Button,
    Divider,
    Image,
    Grid,
    GridItem,
  } from '@chakra-ui/react';
import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { BiMailSend } from 'react-icons/bi';
import SocialButton from '../SocialButton';
import Logo from '../Logo';
import ListHeader from '../ListHeader';
import { useEffect, useState } from 'react';
import logo from './images/logo-door.png'
import { Link as ReachLink } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import { format } from 'date-fns';

const Footer = (params) => {
    const [sendEmail, setSendEmail] = useState(false);
    const colorValue = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')

    const [email, setEmail] = useState(null);
    const [error, setError] = useState(false);

    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    function saveMailingList(){
      if(!validateEmail(email)) { 
        setError(true);
        return;
      }
      setError(false);

      const docRef = doc(db, "email", email);
      setDoc(docRef, {email: email, data: format(Date.now(), 'dd/MM/yyyy'), dateDate: Date.now()});
      setSendEmail(true);
    }


    return (
        <Box
        bg={'brand.500'}
        color={useColorModeValue('gray.700', 'gray.200')}
        minH={'692px'}
        px={{base:0, md:'111px'}}
        >
          <Center>
            <VStack spacing={'40px'} >
                <Heading
                mt={'80px'}
                fontWeight={700}
                fontSize={'30px'}
                color={'white'}>
                    Se inscreva para mais!
                </Heading>
                <Text
                px={{base:'25px', md:0}}
                fontWeight={400}
                fontSize={'18px'}
                color={'white'}>
                  Fique atualizado com todas as novidades a respeito da Sala e Parceiros
                </Text>
                {!sendEmail?
                  <HStack px={{base:'25px', md:0}} height={'56px'} width={'520px'}
                    spacing={{base:5, md:0}} >
                    <Input rounded={0} width={'355px'} isInvalid={error}
                      onChange={(e) => setEmail(e.target.value)}
                      bgColor={'#DDDDDD'} height={'full'} variant='filled' placeholder='Digite seu melhor email' />
                    <Button
                      onClick={() => saveMailingList()}
                      bg={'brand.50'}
                      color={'Background.500'}
                      rounded={0}
                      height={'full'}
                      width={'164px'}>Enviar</Button>
                  </HStack>
                : 
                  <HStack>
                    <Heading color={'white'}>Agradecemos o Interesse!</Heading>
                  </HStack>}
            </VStack>
          </Center>
          <Box my={'73px'} bgColor={'#FDD07A'} height={'6px'} width={'full'} />
          <SimpleGrid columns={{base:2, md:5}} columnGap={2} rowGap={2} w={"full"} color={'white'}>
            <VStack height={'full'} width={'full'}>
              <Image src={logo} />
              <Center>
                <Text fontWeight={800} fontSize={'16px'} >
                  Liberdade para <br /> Suas ideias
                </Text>
              </Center>
              <VStack width={'full'}>
                <Text fontWeight={600} fontSize={'14px'}>
                  © 2022 Sala 33 Ltda - Me
                </Text>
                <Text fontWeight={400} fontSize={'12px'} lineHeight={'14px'}>
                  CNPJ: 24.057.483/0001-29
                </Text>
                <Text fontWeight={600} fontSize={'14px'}>
                  Todos os direitos reservados
                </Text>
              </VStack>
            </VStack>
            <VStack  width={'full'} >
              <Grid templateRows='repeat(5, 1fr)' gap={1}>
                <GridItem w='100%'>
                  <Text fontWeight={700} fontSize={'18px'}>
                    Sobre Nós
                  </Text>
                </GridItem>
                <GridItem w='100%'>
                  <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Imprensa
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Entre pra Sala
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Nosso Time
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Contate a gente
                    </Text>
                  </Link>  
                </GridItem>               
              </Grid>
            </VStack>
            <VStack  width={'full'} >
              <Grid templateRows='repeat(5, 1fr)' gap={1}>
                <GridItem w='100%'>
                  <Text fontWeight={700} fontSize={'18px'}>
                    Produtoras
                  </Text>
                </GridItem>
                <GridItem w='100%'>
                <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                  <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                    Acesso
                  </Text>
                </Link>  
                </GridItem>               
              </Grid>
            </VStack>
            <VStack  width={'full'} >
              <Grid templateRows='repeat(5, 1fr)' gap={1}>
                <GridItem w='100%'>
                  <Text fontWeight={700} fontSize={'18px'}>
                    Artistas
                  </Text>
                </GridItem>
                <GridItem w='100%'>
                <Link as={ReachLink} to={'#'} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                  <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                    Acesso
                  </Text>
                </Link>  
                </GridItem>               
              </Grid>
            </VStack>
            <VStack  width={'full'} >
            <Grid templateRows='repeat(5, 1fr)' gap={1}>
                <GridItem w='100%'>
                  <Text fontWeight={700} fontSize={'18px'}>
                    Nos Acompanhem
                  </Text>
                </GridItem>
                <GridItem w='100%'>
                  <Link href='https://www.linkedin.com/company/sala33' textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      LinkedIn
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link href='https://www.instagram.com/sala30e3/' textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Instagram
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link href='https://discord.gg/BJNqmDm6' textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Discord
                    </Text>
                  </Link>  
                </GridItem>               
                <GridItem w='100%'>
                  <Link href='https://github.com/Sala33' textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight={400} fontSize={'16px'} lineHeight={'19px'}>
                      Github
                    </Text>
                  </Link>  
                </GridItem>               
              </Grid>
            </VStack>
          </SimpleGrid>
      </Box>
    );
};

export default Footer;
import {
    Box,
    Flex,
    IconButton,
    Collapse,
    useColorModeValue,
    Image,
    useDisclosure,
    Link,
    useToast,
    Text,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Heading,
    ModalFooter,
    VStack,
    Spacer,
    HStack,
    InputGroup,
    InputLeftElement,
    Input,
  } from '@chakra-ui/react';
import {
    HamburgerIcon,
    CloseIcon,
    PhoneIcon,
  } from '@chakra-ui/icons';
import DesktopNav from '../DesktopNav';
import MobileNav from '../MobileNav';
import logo from './Images/logo-white.png';
import entry from './Images/entry.PNG';
import loginGuy from './Images/login-guy.png';
import key from './Images/key.png';
import { Link as ReachLink, useNavigate } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { loginRequest } from "../../authConfig";
import { useContext, useEffect, useState } from 'react';
import { useUserAvatar, useUserData, useUserExists } from '../../hooks/useUserData';
import GoogleLogin, { GoogleLogout } from 'react-google-login';
import IdentityContext from '../../Context/IdentityContext';
import { auth, signInWithGoogle, logout, db  } from '../../utils/firebase';
import { useAuthState, useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { useMutation } from 'react-query';
import { doc, setDoc } from 'firebase/firestore';
import { useProdutoraData } from '../../hooks/useProdutorasData';
import LoginModal from '../LoginModal/LoginModal';


const LoginMenu = (props) => {
  const {profilePic, userName, userType} = props;
  const [userDataContext, setUserDataContext] = useContext(IdentityContext);

  function logoutClear(){
    setUserDataContext({
      profilePic: null,
      uid: null,
      userName: null
    });
    logout();
  }

  return(
      <Flex alignItems={'center'}>
        <Menu>
          <MenuButton
            as={Button}
            rounded={'full'}
            variant={'link'}
            cursor={'pointer'}
            minW={0}>
            <Avatar
              w={'48px'}
              h={'48px'}
              src={
                profilePic
              }
              name={userName}
            />
          </MenuButton>
          <MenuList>
            <MenuItem>
              <HStack minW={'320px'} spacing={'20px'}>
                <Avatar src={profilePic} w={'80px'} h={'80px'} />
                <VStack align={'start'} spacing={'15px'}>
                  <Heading fontSize={'26px'} color={'#000000'} whiteSpace={'nowrap'} fontWeight={700}>{userName}</Heading>
                  <VStack align={'start'} spacing={0}>
                    <Text><Link as={ReachLink} 
                      to={userType ==='produtora'? `/produtoras/editar-produtora` : 
                      "artistas/editar-perfil"}>
                        <Text as={'span'} color={'#000000'} fontSize={'14px'} fontWeight={400}>Exibir conta</Text>
                        </Link>
                      </Text>
                      <Link onClick={logoutClear}><Text as={'span'} color={'#000000'} fontSize={'14px'} fontWeight={400}>Sair</Text></Link>
                  </VStack>
                </VStack>
              </HStack>
            </MenuItem>
            {/* <MenuItem><Link as={ReachLink} to={`/editar/produtora`} >Produtora</Link></MenuItem>
            <MenuItem><Link as={ReachLink} to={`/trampos/criar-trampo`} >Criar Trampo</Link></MenuItem>
            <MenuItem><Link as={ReachLink} to={`/oportunidades/criar-oportunidade`} >Criar Oportunidade</Link></MenuItem>
            <MenuItem><Link as={ReachLink} to={`/artistas/editar-perfil`} >Editar Perfil</Link></MenuItem>
            <MenuDivider />
            <MenuItem><Link onClick={logout}>Sair</Link></MenuItem> */}
          </MenuList>
        </Menu>
      </Flex>
  );
};

const Navbar = (props) => {

    const [user, loading, error] = useAuthState(auth);
    const [uid, setUid] = useState();

    const { isOpen, onToggle } = useDisclosure();
    const { data: userDataQuery } = useUserData(uid);
    const { data: produtoraQuery, isLoading: isLoadingProdutora } = useProdutoraData(uid);
    const { isOpen: modalIsopen, onOpen: modalOnOpen, onClose: modalOnClose } = useDisclosure();
    const { isOpen: loginModalIsOpen, onOpen: loginModalOnOpen, onClose: loginModalOnClose } = useDisclosure();

    const [userData, setUserData] = useState(null);

    const [userDataContext, setUserDataContext] = useContext(IdentityContext);

    useEffect(
      () => {
        console.log(userDataContext);
      },[userDataContext]
    );

    useEffect(
      () => {
        if(userDataQuery && !userDataQuery?.userType){
          modalOnOpen();
        } else if(userDataQuery){
          setUserData(userDataQuery);
          const p = {userName: userDataQuery.name};
          if(userDataQuery?.profilePic){
            p.profilePic = userDataQuery.profilePic;
          }
          setUserDataContext({...userDataContext, ...p});
        }
      },[userDataQuery]
    );

    useEffect(
      () => {
        if(user){
          setUid(user.uid);
          setUserDataContext({...userDataContext, uid: user.uid});
        }
      },[user]
    );

    useEffect(
      () => {
        if(!isLoadingProdutora && produtoraQuery){
          setUid(user.uid);
          const p = {userName: produtoraQuery.name};
          if(produtoraQuery?.profilePic){
            p.profilePic = produtoraQuery.profilePic;
          }
          setUserDataContext({...userDataContext, ...p});
        }
      },[produtoraQuery, isLoadingProdutora]
    );

    function setArtista(){
      mutation.mutate('artista');
      modalOnClose();
    }
    function setProdutora(){
      mutation.mutate('produtora');
      modalOnClose();
    };

    const navigate = useNavigate();

    const mutation = useMutation(userType => {
        const id = userDataQuery.id;
        const d = {...userDataQuery};
        d.userType = userType;
        userDataQuery.userType = userType;
        const docRef = doc(db, "users", id);
        return setDoc(docRef, d);
      },
      {
        onSuccess: (data, variables, context) => {
          const path = variables ==='produtora'? `/produtoras/editar-produtora` : "artistas/editar-perfil";
          navigate(`${path}`)
        },
    }
    )

    function closeLoginModal(){
      signInWithGoogle();
      loginModalOnClose();
    }

    return (
    <Box>
      <Modal closeOnOverlayClick={false} isOpen={modalIsopen} onClose={modalOnClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <VStack p={'35px'}>
            <HStack>
              <Image w={'180px'} srcSet='https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Fsala33-pintado.png?alt=media&token=f6387872-0cc0-4d48-a44f-6a49d1020f80' />
              <Image w={'55px'} position={'relative'} transform={'rotate(-29.5deg)'} top={'-20px'} left={'-20px'} srcSet='https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Ffreebird-bird.png?alt=media&token=b93d5362-c5ca-413f-b8d6-37234b7e88ce' />
            </HStack>
            <ModalHeader fontSize={'36px'} fontWeight={700} color={'#7975B5'}>Você é um:</ModalHeader>
          </VStack>
          <ModalBody>
            <HStack w={'full'}>
              <Spacer />
              <Heading fontSize={'18px'} color={'#888888'} maxW={'30%'} textAlign={'center'} fontWeight={400}>Quero oferecer serviços:</Heading>
              <Spacer />
              <Heading  fontSize={'18px'} color={'#888888'} maxW={'30%'} textAlign={'center'} fontWeight={400}>Quero oferecer oportunidades:</Heading>
              <Spacer />
            </HStack>
            <HStack py={'35px'}>
              <Spacer />
              <VStack>
                <Button rounded={0} bgColor={'#00A195'} mr={3} onClick={setArtista}>
                  Artista
                </Button>
              </VStack>
              <Spacer />
              <Button rounded={0} bgColor={'#00A195'} mr={3} onClick={setProdutora}>
                Produtora
              </Button>
              <Spacer />
            </HStack>
          </ModalBody>
          {/* <ModalFooter>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
      <LoginModal closeOnOverlayClick={true} isOpen={loginModalIsOpen} 
        onClose={loginModalOnClose} size={'lg'} loginGuy={loginGuy}
        keySymbol={key} closeLoginModal={closeLoginModal} />
      <Flex
        bg={useColorModeValue('brand.500')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        height={'140px'}>
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <HStack w={'full'} pl={'100px'} pr={'65px'}>
            <Link as={ReachLink} to='/'>
              <Image w={"219px"} src={logo} />
            </Link>
          <Flex display={{ base: 'none', md: 'flex' }} width={'full'} 
                justify={'flex-end'} 
                alignItems={'center'} pr={'42px'} >
            <DesktopNav />
          </Flex>
          {
            user && userData
              ? <LoginMenu userName={userData.name} 
                  profilePic={userDataContext?.profilePic} 
                  userType={userData?.userType} />
              : <Button h={'30px'} w={'100px'} bgColor={'#FCB022'} color={'black'} onClick={loginModalOnOpen}>
                <Text fontSize={'16px'} fontWeight={700}>Login &nbsp;</Text><Image src={entry} w={'20px'}/></Button>
          }        
        </HStack>
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
    );
};
{/* <Button h={'30px'} w={'100px'} bgColor={'#FCB022'} color={'black'} onClick={signInWithGoogle}></Button> */}
export default Navbar;
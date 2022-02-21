import { Button, FormControl, FormErrorMessage, Heading, HStack, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody, ModalContent, ModalOverlay, Spacer, Text, VStack } from "@chakra-ui/react";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useCreateUserWithEmailAndPassword, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth, db } from "../../utils/firebase";
import { useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import { addDoc, doc, setDoc } from "firebase/firestore";
import IdentityContext from "../../Context/IdentityContext";

const SignupSchema = Yup.object().shape({
    email: Yup.string().email('Deve ser um email válido').required('Forneça um email'),
    password: Yup.string().min(7, 'Password muito curto').required('Forneça uma senha')
  });

const LoginModal = ({closeOnOverlayClick, isOpen, onClose, size, loginGuy, keySymbol, closeLoginModal}) => {

    const [createUser, setCreateUser] = useState(false);
    const [userDataContext, setUserDataContext] = useContext(IdentityContext);

    const updateUser = useMutation(
        (user) => {
            const id = user.uid;
            const p = {
                authProvider: 'signIn',
                name: user.email,
                email: user.email,
                id: user.uid,
                uid: user.uid
            }

            setDoc(doc(db, "users", id), {...p});           
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success Creating');
               setUserDataContext({...userDataContext, uid: user.uid});
               onClose();
            },
        }
    );

    const [
        createUserWithEmailAndPassword,
        user,
        loading,
        error,
    ] = useCreateUserWithEmailAndPassword(auth);

    const [
        signInWithEmailAndPassword,
        userLogin,
        loadingLogin,
        errorLogin,
      ] = useSignInWithEmailAndPassword(auth);

    useEffect(
        () => {
            if(error){
                console.log(error);
            } else if(user){
                console.log(user);
                updateUser.mutate(user.user);
            }
        },[error, user]
    );

    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(
        () => {
            if(errorLogin){
                setErrorMessage("Email ou Senha incorretos");
            } else if(userLogin){
                setErrorMessage(null);
                setUserDataContext({...userDataContext, uid: userLogin.uid});
                onClose();
            }
        },[errorLogin, userLogin]
    );

    const { handleChange, handleSubmit, errors, isValid } = useFormik({
    validationSchema: SignupSchema,
    initialValues: SignupSchema.cast(),
    onSubmit: values => {
        if(createUser){
            createUserWithEmailAndPassword(values.email, values.password);
        } else {
            signInWithEmailAndPassword(values.email, values.password);
        }
    }});

    function submit(newUser){
        setErrorMessage(null);
        setCreateUser(newUser);
        handleSubmit();
    }

    return(
        <Modal closeOnOverlayClick={true} isOpen={isOpen} onClose={onClose} size={'lg'}>
        <ModalOverlay />
        <ModalContent>
          <VStack p={'35px'}>
            <HStack>
              <Image w={'180px'} srcSet='https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Fsala33-pintado.png?alt=media&token=f6387872-0cc0-4d48-a44f-6a49d1020f80' />
              <Image w={'55px'} position={'relative'} transform={'rotate(-29.5deg)'} top={'-20px'} left={'-20px'} srcSet='https://firebasestorage.googleapis.com/v0/b/sala33-freebird.appspot.com/o/home-Image%2Ffreebird-bird.png?alt=media&token=b93d5362-c5ca-413f-b8d6-37234b7e88ce' />
            </HStack>
          </VStack>
          <ModalBody>
            <VStack spacing={'30px'} pb={'26px'}>
              <VStack>
                <Heading fontSize={'36px'} fontWeight={700} color={'#7975B5'}>Login</Heading>
                <Text fontSize={'18px'} fontWeight={400} color={'#888888'}>Acesse com sua conta</Text>
              </VStack>
              <VStack spacing={'25px'}>
                <VStack spacing={'15px'}>
                    <FormControl isInvalid={errors.email}>
                        <InputGroup bgColor={'#99D9D599'} w={'394px'}>
                            <InputLeftElement
                            pointerEvents='none'
                            children={<Image w={'20px'} src={loginGuy}/>}
                            />
                            <Input rounded={0} type='text' placeholder='Email' id="email" onChange={handleChange} />
                        </InputGroup>
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.password}>
                        <InputGroup bgColor={'#99D9D599'} w={'394px'}>
                            <InputLeftElement
                            pointerEvents='none'
                            children={<Image w={'20px'} src={keySymbol}/>}
                            />
                            <Input rounded={0} type='password' placeholder='Senha' id="password" onChange={handleChange} />
                        </InputGroup>
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                    {errorMessage?
                        <Text color={'red'}>{errorMessage}</Text>
                    :null}
                </VStack>
                <Button bgColor={'#5853A2'} w={'394px'} h={'40px'} rounded={0} onClick={() => submit(false)} disabled={!isValid}>Login</Button>
                <Spacer />
                <Button bgColor={'#5853A2'} w={'394px'} h={'40px'} rounded={0} onClick={closeLoginModal}>Entrar com Google</Button>
                <VStack spacing={'25px'}>
                  <Text fontSize={'18px'}>Esqueci minha senha, clique aqui pra fazer outra</Text>
                  <Button variant={'outline'} w={'394px'} h={'40px'} rounded={0} onClick={() => submit(true)} disabled={!isValid}>Criar uma conta</Button>
                </VStack>
              </VStack>
            </VStack>

          </ModalBody>
          {/* <ModalFooter>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    );
};

export default LoginModal;
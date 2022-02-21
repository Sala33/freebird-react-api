import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { Box, Button, Icon, Image, Input, InputGroup, InputLeftAddon, Stack, Text, Textarea, useColorModeValue, VStack } from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import ImageUploading from 'react-images-uploading';
import { useMutation } from "react-query";
import { postBlogPost } from "../../../hooks/useBlogPosts";
import MainBodyContainer from "../../Fragments/MainBodyContainer";
import TokenProvider from "../../TokenProvider";

const WritePost = (props) => {
    return(
        <>
        <AuthenticatedTemplate>
            <TokenProvider>
                <PostPage />
            </TokenProvider>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
            <Text>Please Login</Text>
        </UnauthenticatedTemplate>
        </>
    );
};

const PostPage = (props) => {
    const bg = useColorModeValue("white", "gray.800");
    const [value, setValue] = useState("");
    const [images, setImages] = useState([]);

    const onChangeImage = (imageList) => {
        setFieldValue('postHeaderImageSource', imageList[0]?.data_url);
    };

    const mutation = useMutation((params) => postBlogPost(params))

    const owner = {
        id: props.userId,
    }

    const { handleChange, values, setFieldValue, handleSubmit, resetForm } = useFormik({
        initialValues: {
            title: '',
            abstract: '',
            postBody: '',
            tags: '',
            postHeaderImageSource: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80',
            owner
        },
        onSubmit: values => {
          mutation.mutate({ accessToken: props.accessToken, parameters: values });
          setValue('');
          resetForm();
        },
        enableReinitialize: true,
    });

    useEffect(
        () => {
            setFieldValue('postBody', value);
        }, [value, setFieldValue]
    );

    return(
        <>
        <Box pos="relative" overflow="hidden" bg={bg} mt={10}>
        <Box maxW="7xl" mx="auto">
          <Box
            pos="relative"
            pb={{ base: 8, sm: 16, md: 20, lg: 28, xl: 32 }}
            maxW={{ lg: "2xl" }}
            w={{ lg: "full" }}
            zIndex={1}
            bg={bg}
            border="solid 1px transparent"
          >
            <Icon
              display={{ base: "none", lg: "block" }}
              position="absolute"
              right={0}
              top={0}
              bottom={0}
              h="full"
              w={48}
              color={bg}
              transform="translateX(50%)"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </Icon>
            <Box
              mx="auto"
              maxW={{ base: "7xl" }}
              px={{ base: 4, sm: 6, lg: 8 }}
              mt={{ base: 10, sm: 12, md: 16, lg: 20, xl: 28 }}
            >
              <Box
                w="full"
                textAlign={{ sm: "center", lg: "left" }}
                justifyContent="center"
                alignItems="center"
              >
                  <VStack spacing={10}>
                    <InputGroup size={'lg'}>
                        <InputLeftAddon children='Título' />
                        <Input id="title" onChange={handleChange} value={values.title} type='text' placeholder='Título' />
                    </InputGroup>

                    <VStack width={'full'} spacing={0}>
                        <InputGroup size={'lg'}>
                            <InputLeftAddon children='Tags' />
                            <Input id="tags" onChange={handleChange} value={values.tags} type='text' placeholder='Tags' />                       
                        </InputGroup>
                        <Text fontSize={'sm'} fontWeight={'light'}>Separados por vírgula</Text>
                    </VStack>

                    <InputGroup size={'lg'}>
                        <InputLeftAddon children='Resumo' />
                        <Textarea id="abstract" value={values.abstract} onChange={handleChange} type='text' placeholder='Resumo' height={200} />
                    </InputGroup>
                  </VStack>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          position={{ lg: "absolute" }}
          top={{ lg: 0 }}
          bottom={{ lg: 0 }}
          right={{ lg: 0 }}
          w={{ lg: "50%" }}
          border='solid 1px transparent'
        >
        <ImageUploading
        multiple
        value={images}
        onChange={onChangeImage}
        maxNumber={1}
        dataURLKey="data_url"
        >
        {({
        onImageUpload,
        }) => (
            <Image
                h={[56, 72, 96, "full"]}
                w="full"
                fit="cover"
                src={values.postHeaderImageSource}
                alt=""
                loading="lazy"
                onClick={onImageUpload}
            />
        
            )}
        </ImageUploading>        
        </Box>
      </Box>
        <MainBodyContainer>
            <Stack spacing={4}>
                <MDEditor
                    value={value}
                    onChange={setValue}
                    height={600}
                />
            </Stack>
            <Button onClick={handleSubmit} size={'lg'} color={'brand'} textColor={'white'}>Postar</Button>
        </MainBodyContainer>
        </>
    );
};

export default WritePost;

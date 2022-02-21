import { Avatar, Flex, Heading, HStack, useBreakpointValue, VStack, Wrap, WrapItem, Text, SimpleGrid, GridItem, Center, Tag, Input, Textarea, Button, IconButton, InputGroup, InputLeftAddon, } from "@chakra-ui/react";
import MainBodyContainer from "../Fragments/MainBodyContainer";
import LargeBanner from "../Fragments/LargeBanner/LargeBanner";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { patchUserData, useUserData, } from "../../hooks/useUserData";
import TokenProvider from "../TokenProvider";
import { useParams } from "react-router-dom";
import ReactStars from "react-rating-stars-component";
import { useAllBlogPosts } from "../../hooks/useBlogPosts";
import BlogCarousel from "../BlogCarousel/BlogCarousel";
import Testmonial from "../Testmonial/Testmonial";
import { useRating, useReviews } from "../../hooks/useReview";
import { useAccount, useMsal } from "@azure/msal-react";
import { useMutation } from "react-query";
import ImageUploading from 'react-images-uploading';
import { EditIcon } from "@chakra-ui/icons";

const UserProfile = (props) => {
    return(
        <TokenProvider>
            <ProfilePage />
        </TokenProvider>
    );
};

const ProfilePage = (props) => {
    const mobileMainPaging = useBreakpointValue({base: 0, md: 10});
    const mobileTopHeading = useBreakpointValue({base: 10, md: 0});
    const mobileHeadingPaging = useBreakpointValue({base: 3, md: 100});
    const mobileBodyPaging = useBreakpointValue({base: 3, md: 10});
    const mobileColSpanSmall = useBreakpointValue({base: 4, md: 1});
    const mobileColSpanLarge = useBreakpointValue({base: 4, md: 3});

    const [ formData, setFormData ] = useState(null);
    const [ editing, setEditing ] = useState(false);
    const [images, setImages] = useState([]);

    const { id } = useParams();

    const userData = useUserData(id)

    const blogPosts = useAllBlogPosts(id);

    const reviews = useReviews();
    const rating = useRating(id);

    const pageInfoInitial = {
        name: '',
        profissionalTags: '',
        smallDescription: '',
        descripition: '',
        contactInfo: '',
    };
    const { accounts } = useMsal();
    const account = useAccount(accounts[0] || {})

    const isOwner = account?.localAccountId === id;

    const mutation = useMutation((params) => patchUserData(params))

    const { handleChange, values, setFieldValue, handleSubmit } = useFormik({
        initialValues: {
            pageInfo: pageInfoInitial,
        },
        onSubmit: values => {
          mutation.mutate({ accessToken: props.accessToken, parameters: {...values.pageInfo, id: id} });
          setEditing(false);
        },
        enableReinitialize: true,
    });

    useEffect(
        () => {
            if(userData) {
                setFormData(userData);
            }
        }, [userData]
    );

    useEffect(
        () => {
            if(formData) {
                setFieldValue('pageInfo',  formData);
            };
        }, [formData, setFieldValue]
    );

    function getTagValues(){
        return values.pageInfo.profissionalTags?.split(',');
    };

    const onChangeImage = (imageList) => {
        setFieldValue('pageInfo.avatarSrc', imageList[0]?.data_url);
    };

    const onChangeBackground = (imageList) => {
        setFieldValue('pageInfo.backgroundSrc', imageList[0]?.data_url);
    }

    return(
        <>            
            <LargeBanner headerPaging={mobileMainPaging} bgImage={values.pageInfo.backgroundSrc}>
                        {editing?
                                <ImageUploading
                                multiple
                                value={images}
                                onChange={onChangeBackground}
                                maxNumber={1}
                                dataURLKey="data_url"
                                >
                                {({
                                onImageUpload,
                                }) => (
                                    <IconButton
                                    width={'30px'}
                                    colorScheme='teal'
                                    aria-label='Send email'
                                    onClick={onImageUpload}
                                    icon={<EditIcon />}
                                    />
                                
                                    )}
                                </ImageUploading>
                                :
                                null
                            }{' '}
                <HStack px={mobileHeadingPaging} py={mobileTopHeading}>
                    <Wrap>
                        <WrapItem>
                            {editing?
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
                                    <Avatar showBorder borderWidth={3} borderColor={'red'} 
                                                size='2xl' 
                                                name={values.pageInfo.name} 
                                                src={values.pageInfo.avatarSrc}
                                                onClick={onImageUpload} />
                                
                                    )}
                                </ImageUploading>
                                :
                                <Avatar showBorder borderWidth={2} borderColor={'gray.50'} 
                                size='2xl' 
                                name={values.pageInfo.name} 
                                src={values.pageInfo.avatarSrc} />
                            }{' '}
                        </WrapItem>
                    </Wrap>
                </HStack>              
            </LargeBanner>
            <MainBodyContainer>
                <SimpleGrid columns={4} columnGap={6} rowGap={6} w={"full"} py={5} px={mobileBodyPaging}>
                    <GridItem colSpan={mobileColSpanSmall}>
                        <VStack>
                            <Flex w={"full"} alignContent={"flex-start"} px={3}>
                                <Heading fontSize={"lg"} color={"brand.900"}>Biografia</Heading>
                            </Flex>
                                {!editing
                                    ?   
                                        <Text fontSize={'sm'}>
                                            {values.pageInfo.smallDescription}                              
                                        </Text>
                                    :   <Textarea id="pageInfo.smallDescription" onChange={handleChange} value={values.pageInfo.smallDescription} size={'lg'} placeholder={values.pageInfo.smallDescription}>                         
                                        </Textarea>
                                }
                            <VStack padding={2}>                              
                                {!editing
                                ?   <Button href={`mailto:${values.pageInfo.contactInfo}`} size={'sm'}>Fale Comigo</Button>
                                :
                                <InputGroup size={'sm'}>
                                    <InputLeftAddon children='Contato' />
                                    <Input 
                                    id="pageInfo.contactInfo" 
                                    value={values.pageInfo.contactInfo} 
                                    placeholder={values.pageInfo.contactInfo}
                                    onChange={handleChange} />
                                </InputGroup>
                            }
                            { isOwner && !editing ? 
                                <Button colorScheme={'green'} onClick={() => setEditing(!editing)}>Editar Pagina</Button> : null}
                            {editing ?
                                <HStack>
                                    <Button colorScheme={'red'} onClick={() => setEditing(!editing)}>Cancelar</Button>
                                    <Button colorScheme={'green'} onClick={handleSubmit}>Salvar</Button>
                                </HStack> 
                                : null}          
                            </VStack>
                        </VStack>
                    </GridItem>
                    <GridItem colSpan={mobileColSpanLarge}>
                            <Center>
                                <VStack width={'full'} spacing={5}>
                                    {!editing ?
                                        <Heading>{values.pageInfo.name}</Heading>
                                        :
                                        <InputGroup>
                                            <InputLeftAddon children='Nome' />
                                            <Input id="pageInfo.name" placeholder={values.pageInfo.name} 
                                                onChange={handleChange}  
                                                color={"brand.900"}
                                                value={values.pageInfo.name} />
                                        </InputGroup>
                                    }

                                    <HStack>
                                        {!editing
                                            ?   getTagValues()?.map(
                                                    (item, index) => {
                                                        return (
                                                            <Tag key={index} color={"brand.600"} fontWeight={"semibold"} fontSize={"md"}>#{item}</Tag>
                                                        );
                                                    })
                                            : 
                                            <VStack>
                                            <InputGroup>
                                                <InputLeftAddon children='Tags' />
                                                <Input 
                                                    id="pageInfo.profissionalTags" 
                                                    colorScheme={'white'}
                                                    onChange={handleChange} 
                                                    placeholder={values.pageInfo.profissionalTags} 
                                                    value={values.pageInfo.profissionalTags} />
                                            </InputGroup>
                                                
                                                <Text m={0} fontSize={'x-small'}>Separado por vírgulas</Text>
                                            </VStack>
                                        }
                                    </HStack>
                                    {rating
                                        ?
                                            <Flex
                                                boxShadow="rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
                                                justifyContent="space-between"
                                                flexDirection="column"
                                                overflow="hidden"
                                                color="gray.300"
                                                bg="base.d100"
                                                rounded={5}
                                                flex={1}
                                                px={5}
                                                py={1}
                                                >
                                                    <ReactStars
                                                    count={5}
                                                    size={32}
                                                    value={rating}
                                                    edit={false}
                                                    activeColor="#ffd700"
                                                    />
                                            </Flex>         
                                        :   null
                                    }                                                                                                                      
                                </VStack>
                            </Center>
                        </GridItem>
                </SimpleGrid>
                <VStack>
                {blogPosts ?                                      
                    <BlogCarousel blogPosts={blogPosts} />
                    :
                    null
                }
                <SimpleGrid m={0} columns={{base: 1, md:2}} columnGap={6} rowGap={6} w={"full"}>
                {reviews ?
                    reviews.slice(0, 2).map(
                        (item, index) => {
                            return(
                                <Testmonial key={index} {...item} />
                            );
                        }
                    )                                      
                    : null
                }
                </SimpleGrid>            
            </VStack> 
        </MainBodyContainer>
    </>
    );
};

export default UserProfile;

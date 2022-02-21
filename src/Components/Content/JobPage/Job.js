import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { AspectRatio, Button, Center, Checkbox, GridItem, Heading, HStack, Image, Input, Link, ListItem, SimpleGrid, Stack, Text, Textarea, UnorderedList, useBreakpointValue, VStack } from "@chakra-ui/react";
import { Circle, GoogleMap, LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { useFormik } from "formik";
import {  useEffect, useState } from "react";
import MainBodyContainer from "../../Fragments/MainBodyContainer";
import jobBG from './Images/job-bg.png'
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import TokenProvider from "../../TokenProvider";
import { useJobData } from "../../../hooks/useJobData";
import { useParams } from "react-router-dom";

const libraries = ["places"];

const Job = (props) => {
  return(
      <TokenProvider>
          <JobPage />
      </TokenProvider>
  );
};


const JobPage = (props) => {
    const imageSpan = useBreakpointValue({base: 3, md: 2});
    const detailsSpan = useBreakpointValue({base: 3, md: 1});
    const mobilePaging = useBreakpointValue({base: 0, md: 5});

    const { id } = useParams();

    const pageInfoInitial = {
        title: 'Eu crio trilhas sonoras para o seu filme.',
        price: '99',
        smallDescription: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Facilisis volutpat est velit egestas dui id ornare.`,
        topics:['Lorem ipsum dolor sit amet', 'Consectetur adipiscing elit', 'Integer molestie lorem at massa', 'Facilisis in pretium nisl aliquet'],
        descripition: '# Headline \n ## Sub-header \n ---------- \n ~~Crossed~~ \n `Code` \n [Link](#) \n - list \n - list2 \n > Quote',
        location: {
          lat: -22.2175968,
          lng: -49.9487485,
        }
    };
    
    const [count, setCount] = useState(pageInfoInitial.topics.length);
    const [ formData, setFormData ] = useState(null);
 
    const { handleChange, values, setFieldValue } = useFormik({
        initialValues: {
            pageInfo: pageInfoInitial,
            EditingToggle: false,
        },
        onSubmit: values => {
          alert(JSON.stringify(values, null, 2));
        },
        enableReinitialize: true,
    });

    const jobData = useJobData(id);

    useEffect(
      () => {
          if(jobData) {
              setFormData(jobData);
          }
      }, [jobData]
  );

  useEffect(
    () => {
        if(formData) {
            setFieldValue('pageInfo',  formData);
            };
        }, [formData, setFieldValue]
    );

    const isOwner = true;

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
      }

    const deleteTopic = (value) => {
        values.pageInfo.topics = removeItemOnce(values.pageInfo.topics, value);
        setCount(values.pageInfo.topics.length);
    };

    function handleTopicblur(e) {
        values.pageInfo.topics = values.pageInfo.topics?.filter((entry) => { return entry.trim() !== ''; });
        setCount(values.pageInfo.topics.length);
    };

    function handleEditChange(e) {
        handleTopicblur();
        handleChange(e);
    };

    const [zoom, setZoom] = useState(15); // initial zoom
    const [center, setCenter] = useState(values.pageInfo.location);

    const [places, setPlaces] = useState(null);

    useEffect(() => {
      places?.map(
        (item) => {
          return(
            setCenter({
              lat: item.geometry.location.lat(),
              lng: item.geometry.location.lng(),
              }
            )
          );
        });
      }, [places]);

    const[searchBox, setSearchBox] = useState(null);

    function searchBoxOnLoad (ref)
    {
      setSearchBox(ref);
    }

    function handlePlacesChanged(){
      setPlaces(searchBox.getPlaces());
    };

    const circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      radius: 100,
      zIndex: 1
    }

    const [markdownValue, setMarkdownValue] = useState(values.pageInfo.descripition);

    return(
        <MainBodyContainer>
            <SimpleGrid columns={3} columnGap={3} rowGap={6} w={"full"}>
                <GridItem colSpan={imageSpan}>
                    <Stack height={'full'}>
                        {!values.EditingToggle
                        ? <Heading fontSize={'3xl'} color={'brand.900'}>{values.pageInfo.title}</Heading>
                        : <Input id="pageInfo.title" value={values.pageInfo.title} placeholder={values.pageInfo.title} onChange={handleChange} fontSize={'3xl'} color={'brand.900'}></Input> }
                        
                    </Stack>
                </GridItem>
                <GridItem colSpan={detailsSpan}>
                    <Center height={'full'}>
                        <VStack>
                            <Link color={'brand.900'}>Perfil do Artista</Link>
                            { isOwner ? <Checkbox id="EditingToggle" onChange={handleEditChange}>Editar Pagina</Checkbox> : null}
                        </VStack>
                    </Center>
                </GridItem>
            </SimpleGrid>
            <SimpleGrid columns={3} columnGap={3} rowGap={10} w={"full"}>
                <GridItem colSpan={imageSpan}>
                    <AspectRatio ratio={1.618}>
                        <Image
                            borderRadius={'md'}
                            alt={'Hero Image'}
                            fit={'cover'}
                            align={'center'}
                            w={'100%'}
                            h={'100%'}
                            src={ jobBG }
                        />
                    </AspectRatio>
                </GridItem>
                <GridItem colSpan={detailsSpan}>
                    <VStack spacing={5} mx={mobilePaging} alignItems={"stretch"} w={"full"}>
                        <HStack>
                        <Text as={'span'} color={'brand.600'} fontSize={'3xl'}>R$</Text>
                        {!values.EditingToggle
                            ?   <Text as={'span'} color={'brand.600'} fontSize={'3xl'}>{values.pageInfo.price}</Text>
                            :   <Input width={'30%'} id="pageInfo.price" value={values.pageInfo.price} placeholder={values.pageInfo.price} onChange={handleChange} color={'brand.600'} fontSize={'3xl'}></Input>
                            }
                            <Text as={'span'} color={'brand.600'} fontSize={'3xl'}>/</Text>
                            <Text as={'span'} fontSize={'xl'}>hora</Text>
                        </HStack>                       
                        {!values.EditingToggle
                            ?   <Text>
                                    {values.pageInfo.smallDescription}                              
                                </Text>
                            :   <Textarea value={values.pageInfo.smallDescription} id="pageInfo.smallDescription" size={'lg'} onChange={handleChange} placeholder={values.pageInfo.smallDescription}></Textarea>
                        }
                        <Stack px={mobilePaging} pb={5}>
                            <UnorderedList spacing={3}>
                                {!values.EditingToggle
                                    ?   values.pageInfo.topics?.map(
                                            (item, index) => {
                                                return(
                                                    <ListItem key={index}>{item}</ListItem>
                                                );
                                            })
                                    : values.pageInfo.topics?.map(
                                        (item, index) => {
                                            return(
                                                <HStack key={`stack-${index}`}>
                                                    <Input key={index} id={`pageInfo.topics[${index}]`} value={item} placeholder={item} onBlur={handleTopicblur} onChange={handleChange}></Input>
                                                    <Link onClick={() => deleteTopic(item)}><DeleteIcon  key={`btn-${index}`} size={'sm'} /></Link>
                                                </HStack>
                                            );
                                        })
                                }                 
                            </UnorderedList>
                            {values.EditingToggle && count < 5
                                    ?   <Link onClick={() => {values.pageInfo.topics.push('');
                                            setCount(values.pageInfo.topics.length);
                                            }}><AddIcon /></Link> 
                                    :  null 
                                }
                        </Stack>
                        <Stack>
                          {values.EditingToggle
                                    ?   <HStack>
                                          <Button w={'full'} colorScheme='red' size='md'>
                                              Cancel
                                          </Button>
                                          <Button w={'full'} colorScheme='green' size='md'>
                                              Confirm
                                          </Button>
                                        </HStack>
                                    : <Center>
                                          <Button w={'full'} colorScheme='brand' size='md'>
                                              Button
                                          </Button>
                                      </Center>
                                }
                        </Stack>
                    </VStack>
                </GridItem>
                <GridItem colSpan={imageSpan}>
                    <VStack spacing={5} alignItems={"stretch"} w={"full"} px={mobilePaging}>
                        <Heading size='xl' color={'brand.700'}>Sobre</Heading>
                        <Stack px={3}>
                        {values.EditingToggle
                          ? <MDEditor
                              id="pageInfo.description"
                              value={markdownValue}
                              onChange={setMarkdownValue}
                              previewOptions={{
                                rehypePlugins: [[rehypeSanitize]],
                              }}
                            />
                          : <MDEditor.Markdown 
                              source={markdownValue}
                              rehypePlugins={[[rehypeSanitize]]}
                            />
                        }                        
                        </Stack>

                          <LoadScript id="script-loader" googleMapsApiKey={process.env.REACT_APP_API_GOOGLE_API} libraries={libraries}>
                            {values.EditingToggle
                              ?<StandaloneSearchBox
                                  onLoad={searchBoxOnLoad}
                                  onPlacesChanged={handlePlacesChanged}
                                >
                                  <input
                                    type="text"
                                    placeholder="Indique uma Localização"
                                    style={{
                                      boxSizing: `border-box`,
                                      border: `1px solid transparent`,
                                      width: `240px`,
                                      height: `32px`,
                                      padding: `0 12px`,
                                      borderRadius: `3px`,
                                      boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                      fontSize: `14px`,
                                      outline: `none`,
                                      textOverflow: `ellipses`
                                    }}
                                  />
                                </StandaloneSearchBox>
                                : null
                            }
                              <AspectRatio ratio={16 / 9}>
                                <GoogleMap
                                  mapContainerStyle={{width: '100%'}}
                                  center={center}
                                  zoom={zoom}
                                >                                 
                                 <Circle
                                    // required
                                    center={center}
                                    // required
                                    options={circleOptions}
                                  />
                                </GoogleMap>
                              </AspectRatio> 
                          </LoadScript>                                                        
                    </VStack>
                </GridItem>
            </SimpleGrid>
        </MainBodyContainer>
    );
};

export default Job;
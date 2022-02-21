import { FormControl, GridItem, HStack, Radio, RadioGroup, SimpleGrid, useBreakpointValue, Input, Button, Wrap, WrapItem, Center } from "@chakra-ui/react";
import ArtistCard from "../../ArtistCard";
import MainBodyContainer from "../../Fragments/MainBodyContainer";
import TypeList from "../../Fragments/TypeList/TypeList";
import JobCard from "../../JobCard";
import { useFormik } from 'formik';
import { Search2Icon } from "@chakra-ui/icons";
import { useAllJobData } from "../../../hooks/useJobData";
import { useUsers } from "../../../hooks/useUserData";

// MAX CHAR ARTIST DESCRIPTION = 100
// MAX CHAR JOB DESCRIPTION = 15
// MAX TAGS ARTIST DESCRIPTION = 2

const test = [
    {
        key: 1,
        name: "Aluguel",
        Subcategories: [
            "Lorem",
            "Ipsum",
            "Odit"
        ]
    },
    {
        key: 2,
        name: "Desenvolvimento",
        Subcategories: [
            "Lorem",
            "Ipsum",
            "Odit"
        ]
    },
    {
        key: 3,
        name: "Cinema",
        Subcategories: [
            "Lorem",
            "Ipsum",
            "Odit"
        ]
    }
];

const PageList = () => {
    const mobileColumnSizeList = useBreakpointValue({base: 5, md: 1});
    const mobileColumnSizeNav = useBreakpointValue({base: 5, md: 4});
    const mobileColumnSizeSearch = useBreakpointValue({base: 5, md: 3});

    const jobsList = useAllJobData();
    
    const { handleChange, values } = useFormik({
        initialValues: {
            SearchType: 'Jobs',
        },
        onSubmit: values => {
          alert(JSON.stringify(values, null, 2));
        },
      });

      const jobRender = (selection) => {
          return values?.SearchType === 'Jobs';
      }

      const artists = useUsers(50);
      
    return(
        <MainBodyContainer rowSpacing={"0"}>            
            <FormControl as='fieldset'>
                <RadioGroup name="SearchType">
                    <SimpleGrid columns={5} columnGap={6} rowGap={6} w={"full"}>
                            <GridItem colstart={2} colEnd={3}>
                                <HStack spacing={10}>
                                    <Radio onChange={handleChange} value='Jobs' defaultChecked>Jobs</Radio>
                                    <Radio onChange={handleChange} value='Artist'>Artist</Radio>
                                </HStack>
                            </GridItem>
                            <GridItem colSpan={mobileColumnSizeSearch}>
                                <HStack spacing={1}>
                                    <Input id='searchString' placeholder='Busca' />
                                    <Button
                                        mt={4}
                                        colorScheme='brand'
                                        type='submit'
                                    ><Search2Icon /></Button>
                                </HStack>
                            </GridItem>
                        </SimpleGrid>
                </RadioGroup>
            </FormControl>
            <SimpleGrid m={0} columns={5} columnGap={6} rowGap={6} w={"full"}>               
                <GridItem colSpan={mobileColumnSizeList}>
                    <TypeList itemList={test} />
                </GridItem>
                <GridItem colSpan={mobileColumnSizeNav}>
                    <Wrap spacing={"30px"} px={6}>
                        {jobRender()? 
                            jobsList?.map((item, int) => {
                                return(
                                    <WrapItem key={int} width={{ base: '100%', sm: '100%', md: '100%', lg: '30%' }}>
                                        <JobCard topPadding={1} pricePadding={5} {...item} />  
                                    </WrapItem>
                                );
                            })
                            :
                            artists?.map((item, int) => {
                                return(
                                    <WrapItem key={int}  width={{ base: '100%', sm: '100%', md: '100%', lg: '30%' }}>
                                        <Center key={int} w='full'>
                                            <ArtistCard {...item} />  
                                        </Center>
                                    </WrapItem>
                                );
                            })
                        }
                    </Wrap>
                </GridItem>
            </SimpleGrid>
        </MainBodyContainer>
    );
};

export default PageList;

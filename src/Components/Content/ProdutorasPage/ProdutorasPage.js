import { Box,  Center,  Flex, Heading, Radio, RadioGroup, Skeleton, Text, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useProdutorasData } from "../../../hooks/useProdutorasData";
import { categorias } from "../../../utils/categorias";
import { auth } from "../../../utils/firebase";
import ProdutoraBox, { ProdutoraListItem } from "../../ProdutorasBox/ProdutorasBox";

const radioStyling = {
  as:'span',
  fontWeight:'800',
  fontSize:'16px',
  color:'black'
};

const ProdutorasPage = (props) => {
  const [value, setValue] = useState('all')

  const [ displayProjects, setDisplayProjects ] = useState([]);

  const { data, isLoading } = useProdutorasData();

  const [user] = useAuthState(auth);

  useEffect(
    () => {
      function containsTag(arr){
        return arr.tags?.includes(value)
      }
      if(data){
        if(value === 'all'){ 
          setDisplayProjects(Object.values(data)) 
        } else {
          setDisplayProjects(Object.values(data).filter(containsTag));
        }
      }
    }, [data, value]
  );
  
  return(
      <VStack width={'full'}  px={{base:0, md:'100px'}} py={'28px'} spacing={'28px'}>
          <Box height={'168px'} width={'full'} px={'14px'}>
            <Box position={'absolute'} zIndex={-1} mx={'-50vw'} mt={-1} height={'168px'} width={'150vw'} bgColor={'#FDD07A1F'} />
              <VStack py={'13px'} width={'full'} alignItems={'start'} spacing={'24px'}>
                <Box px={'6px'} py={'2px'}>
                  <Heading fontSize={'24px'} 
                  fontWeight={'800'} color={'black'}>Descubra Projetos Incríveis</Heading>
                </Box>
                <Box height={'84px'} width={'full'} >
                  <RadioGroup colorScheme={'brand'} onChange={setValue} value={value}>
                    <Flex width={'full'} height={'84px'} alignItems={'center'} justifyContent={'space-between'} px={'22px'}>
                      <Radio value='all'><Text {...radioStyling}>Todos</Text></Radio>
                      {categorias.map(
                        (item, index) => {
                          return(
                            <Radio key={index} value={item.value}><Text {...radioStyling}>{item.label}</Text></Radio>
                          );
                        }
                      )}
                    </Flex>
                  </RadioGroup>
                </Box>
              </VStack>
          </Box>
          {displayProjects.length > 0? 
            displayProjects.map(
              (item, index) => {
                return(
                  <React.Fragment key={`${index}-fragment`}>
                    <ProdutoraListItem user={user} key={index} {...item} />
                    {index % 2 === 0?
                      <Box key={`${index}-box`} 
                        position={'absolute'} 
                        zIndex={-2} mx={'-50vw'}
                        top={`${650 + (300 * index)}px`}
                        height={'395px'} width={'150vw'} 
                        bgColor={index % 4 === 0? '#99D9D538' : '#FDD07A1F'} />
                      :
                      null
                    }
                  </React.Fragment>
                );
              }
            )
            :
              <Box height={'168px'} width={'full'} bgColor={'#C4C4C4'} px={'14px'}>
                <Center width={'full'} height={'full'}>
                    <Heading>
                      Nenhum Projeto Encontrado
                    </Heading>
                </Center>
              </Box>
            }
      </VStack>
  )
};

export default ProdutorasPage;

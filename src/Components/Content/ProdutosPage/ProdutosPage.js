import { Box, Center, Flex, Heading, Radio, RadioGroup, Text, VStack } from "@chakra-ui/react"
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useProjectsData } from "../../../hooks/useProjectsData";
import { categorias } from "../../../utils/categorias";
import { auth } from "../../../utils/firebase";
import ProdutoraBox from "../../ProdutorasBox/ProdutorasBox";

const radioStyling = {
  as:'span',
  fontWeight:'800',
  fontSize:'16px',
  color:'black'
};

const projetosList = [
  {
    name: '',
    data: '',
    apresentacao: '',
    link: '',
    url: '',
    preview: '',
    tags: ['all']
  },
];

const ProdutosPage = (props) => {
  const [value, setValue] = useState('all')

  const [ displayProjects, setDisplayProjects ] = useState([]);

  const [user] = useAuthState(auth);

  useEffect(
    () => {
      function containsTag(arr){
        return arr.tags?.includes(value)
      }
      setDisplayProjects(projetosList.filter(containsTag));
    }, [value]
  );
  
  return(
      <VStack width={'full'}  px={{base:0, md:'100px'}} py={'28px'} spacing={'28px'}>
          <VStack width={'full'} 
          alignItems={'start'} spacing={0}
          p={'12px'}>        
            <Text fontSize={'16px'} fontWeight={400}>
              Um <Text as={'span'} fontWeight={'bold'}>Produto </Text>
                é um <Text as={'span'} fontWeight={'bold'}>Projeto </Text>executado.
            </Text>
            <Text fontSize={'16px'} fontWeight={400}>
            Nesse estágio ele já está apto a ser consumido e porque não comercializado. O grande desafio dessa importante etapa 
            é identificar as formas possíveis de se conectar o <Text as={'span'} fontWeight={'bold'}>Produto </Text> com o público que poderá consumí-lo, na expectativa de encontrar 
            formas de sustentação para que o <Text as={'span'} fontWeight={'bold'}>Produto </Text> se desenvolva, gerando valor ambos, realizador e consumidor.
            </Text> 
          </VStack>
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
                            <Radio value={item.value}><Text {...radioStyling}>{item.label}</Text></Radio>
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
                    <ProdutoraBox user={user} key={index} {...item} />
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

export default ProdutosPage;

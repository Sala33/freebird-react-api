import { Box, Center, Flex, Heading, Radio, RadioGroup, Skeleton, Stack, Text, VStack } from "@chakra-ui/react"
import React, { useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSearchParams } from "react-router-dom";
import IdentityContext from "../../../Context/IdentityContext";
import { useProjectsData } from "../../../hooks/useProjectsData";
import { useWeatherTest } from "../../../hooks/useUserData";
import { categorias } from "../../../utils/categorias";
import { auth } from "../../../utils/firebase";
import ProdutoraBox from "../../ProdutorasBox/ProdutorasBox";
import aprendendoIMG from "./Images/aprendendomusica.png"
import colibri from "./Images/colibriapresenta_cut.jpg"
import freebird from "./Images/freebird-logo.png"

const radioStyling = {
  as:'span',
  fontWeight:'800',
  fontSize:'16px',
  color:'black'
};

const projetos = [
  {
    Title: 'Aprendendo Música com Realidade Mista',
    Data: '24/02/2022',
    info: 'Com a intenção de trazer uma nova forma de aprender a tocar um instrumento e estudar música, o aplicativo <b>"Aprendendo Música com Realidade Mista"</b>, integra tecnologia e ensino, proporcionando um aprendizado além de divertido, mais intuitivo e prazeroso para que o processo de aprendizagem musical seja estimulado e potencializado através da utilização de realidade virtual e realidade aumentada no processo de aprendizagem.',
    imgSrc: aprendendoIMG,
    url: 'aprendendo-musica',
    tags: ['all', 'arvr', 'games']
  },
  {
    Title: 'Colibri! Apresenta',
    Data: '03/11/2020',
    info: '<b>“Colibri! Apresenta”</b> é uma websérie em 7 episódios sobre os caminhos da composição (referências de vida, processo criativo e execução das canções). Um trabalho de curadoria musical com criadores que estão começando a mostrar a cara no cenário e intenção de destacá-los, através de um material audiovisual de qualidade, na cidade de Marília-SP e além dela.',
    imgSrc: colibri,
    url: 'colibri-apresenta',
    tags: ['all', 'audiovisual', 'musica', 'eventos']
  },
  {
    Title: 'Freebird',
    Data: '19/08/2019',
    info: '<b>“Freebird”</b> é uma ferramenta tecnológica open source desenvolvida a partir da necessidade de gestão de projetos, buscando promover e organizar o encontro entre contratantes e prestadores de serviços criativos. Indicado para empresas de qualquer tipo, ecossistemas ou associações de classe e cooperativas que precisam gerenciar seus talentos na busca de maior aproveitamento das oportunidades.',
    imgSrc: freebird,
    url: 'freebird',
    tags: ['all', 'dados', 'platform']
  },
];

const ProjetoPage = (props) => {
  const [value, setValue] = useState('all')
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, isLoading } = useProjectsData();

  const [ displayProjects, setDisplayProjects ] = useState();

  const [user] = useAuthState(auth);

  useEffect(
    () => {
      function containsTag(arr){
        return arr.tags?.includes(value)
      }

      if(data){
        const searchOwner = searchParams.get("owner");
        if(searchOwner){
          setDisplayProjects(data.filter(o => o.owner === searchOwner));
          return;
        }

        if(value === 'all'){
          console.log(data);
          setDisplayProjects(data);
          return;
        }
        if(!isLoading && data){
          setDisplayProjects(data.filter(containsTag));
        }
      }
    }, [data, isLoading, value]
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
                            <Radio value={item.value}><Text {...radioStyling}>{item.label}</Text></Radio>
                          );
                        }
                      )}
                    </Flex>
                  </RadioGroup>
                </Box>
              </VStack>
          </Box>
          {displayProjects && displayProjects?.length !== 0
            ?
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

export default ProjetoPage;

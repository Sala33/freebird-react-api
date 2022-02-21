import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Grid, GridItem, Heading, HStack, Input, Skeleton, Text, VStack, Link, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Textarea, Image, InputGroup, InputLeftAddon, AspectRatio, Select, SkeletonText, Stack, FormControl, Tooltip, FormErrorMessage, Spacer, FormHelperText } from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { useFormik } from "formik";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db, storage } from "../../../utils/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { Circle, GoogleMap, LoadScript, StandaloneSearchBox } from "@react-google-maps/api";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { nanoid } from "nanoid";
import { useAuthState } from "react-firebase-hooks/auth";
import SliderCarousel from "../../SliderCarousel";
import { useUserData } from "../../../hooks/useUserData";
import * as Yup from 'yup';

const SignupSchema = Yup.object().shape({
    categoria: Yup.string().max(100, 'Nome muito Longo').required('Categoria é obrigatória'),
    comunicacao: Yup.string().required('Adicione uma forma de comunicação!'),
    contratacao: Yup.string().required('Adicione uma forma de Contratação!'),
    dataCriacao: Yup.string().required('Data de Criação!'),
    inicio: Yup.string().required('Data de Início!'),
    termino: Yup.string().required('Data de Termino!'),
    habilidades: Yup.string().required('Habilidades necessárias para o trabalho'),
    ferramentas: Yup.string().required('Adicione ferramentas de trabalho!'),
    idioma: Yup.string().required('Idiomas necessários!'),
    about: Yup.string().required('Sobre a oportunidade'),
    referencias: Yup.array(Yup.string().url('Deve ser um link válido').required('Adicione até 4 links de referência.'))
        .max(4, 'Mais de quatro links encontrados')
        .notRequired(),
    location: Yup.object().shape({lat: Yup.number(), lng: Yup.number()}),
    orcamento: Yup.string().required('Orçamento do trabalho!'),  
    pagamento: Yup.string().required('Forma de pagamento!'),
    ownerProj: Yup.object().shape({id: Yup.string().required('Id do projeto não encontrado'), name: Yup.string().required('Adicione um projeto!')}),
    Title: Yup.string().max(250, 'Título muito longo').required('Coloque um Título no Trabalho'),
    modelo: Yup.string().max(250, 'Modelo é muito longo').required('Especifique um modelo de Trabalho'),
    url: Yup.string().required('A url é obrigatória na criação'),
    local: Yup.string().max(250, 'Título muito longo'),  
});


const initialData = {
    Title: '',
    about: '',
    referencias: [],
    categoria: '',
    comunicacao: '',
    contratacao: '',
    dataCriacao: format(Date.now(), 'dd/MM/yyyy'),
    embed: '',
    ferramentas: '',
    habilidades: '',
    idioma: '',
    inicio: format(Date.now(), 'dd/MM/yyyy'),
    location: {lat: -23.5557714, lng: -46.6395571},
    modelo: '',
    orcamento: '',
    owner: '',
    ownerProj: '',
    pagamento: '',
    termino: format(Date.now(), 'dd/MM/yyyy'),
    url: '',
    pic: '',
    local: '',
};
const libraries = ["places"];

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

const OportunitiesPage = (props) => {
    const {editPage} = props;
    const { oportunidade } = useParams();

    const [current, setCurrent] = useState(null);
    const [ownerID, setOwnerID] = useState(null);

    const [uid, setUid] = useState();
    const { data: userData } = useUserData(uid);
    const [user] = useAuthState(auth);

    useEffect(
        () => {
          if(user){
            setUid(user.uid);
          }
        },[user]
      );

    const { handleChange, values, setFieldValue, handleSubmit, setValues, errors, isValid } = useFormik({
        validationSchema: SignupSchema,
        initialValues: {
            ...initialData
        },
        onSubmit: values => {
            if(values.url){
                submitData();
            }
        },
        enableReinitialize: true,
    });

    async function getOportundadeData(url){
        const q = query(collection(db, 'oportunidades'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                setOwnerID(doc.id);
                setCurrent(doc.data());
                // console.log(doc.id, " => ", doc.data());
                });
        } else{
            console.log('not found');
        }
    };

    const [projetos, setProjetos] = useState([]);

    async function getProjetosData(uid){
        const q = query(collection(db, 'projetos'), where("owner", "==", uid));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty){
            let projetosData = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                const projData ={
                    name: doc.data().name,
                    id: doc.data().owner
                } 
                projetosData.push(projData);
                // console.log(doc.id, " => ", doc.data());
                });
            setProjetos(projetosData);
        }
    };

    const [produtora, setProdutora] = useState(null);

    async function getProd(id){
        const docRef = doc(db, "produtoras", id);
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
            setProdutora(docSnap.data());
        } else {
            setProdutora({
                name: 'Sala 33',
                // cadastro: format(Date.now(), 'dd/MM/yyyy'),
                // socialMedia: ['Coloque mídias sociais'],
                // miniBio: 'Adicione uma mini-biografia',
                // habilidades: ['O que te diferencia'],
                // url: 'escolha uma URL para o acesso',
                // contact: 'Telefone de Contato',
                // profilePic: 'https://via.placeholder.com/500x500',
                // bannerPic: 'https://via.placeholder.com/1280x718',
            });
        }
    }

    useEffect(() => {
        if(oportunidade){
            getOportunidades();
            getOportundadeData(oportunidade);
        }
        else{
            toggleEditingStateFor('info');
            setOwnerID(nanoid());
        }
    }, [oportunidade]);

    function resetImageList(){
        let imgList = [];
                
        imgList.push(
        {
            dataUrl: current?.pic,
            file: null,
            origin: 'avatar',
            index: 0,
        });

        setImageList(imgList);
    }

    useEffect(() => {
        if(current){
            setValues({...initialData ,...current});
            resetImageList();
            setCenter(current.location);
            getProd(current.owner);
            getProjetosData(current.owner);
        }
    }, [current])

    // useEffect(() => {
    //     console.log(values);
    // }, [values])

    const [editing, setEditing] = useState({});

    function toggleEditingStateFor(key){
        const cp = {...editing};
        const val = cp[key];
        cp[key] = !val;
        setEditing(cp);
    }

    function addFieldForLinks(){
        setFieldValue('referencias', [...values.referencias, ' ']);
    }

    const [imageList, setImageList] = useState([]);

    function addImage(file, key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (!(i.origin === key && i.index === index)));

        const img = {
            dataUrl: URL.createObjectURL(file),
            file: file,
            origin: key,
            index: index,
        };

        setFieldValue('pic', img.dataUrl);

        result.push(img);
        setImageList(result);
    }

    function getSrc(key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (i.origin === key && i.index === index));

        return result[0]?.dataUrl ?? undefined;
    }

    const inputRef = useRef();

    useEffect(
        () => {
            if(!oportunidade && user){
                setFieldValue('owner', user.uid);
                getProjetosData(user.uid);
            }
        },[user, oportunidade]
    );

    const DatePickerCustom = forwardRef(({ value, onClick }, ref) => (
        <Button size={'sm'} className="example-custom-input" onClick={onClick} ref={ref}>
          {value}
        </Button>
    ));

    function getDateFromString(dateString){
        var date= dateString.split("/");
        var f = new Date(date[2], date[1] -1, date[0]);
        return f;
    }

    function setStringDate(key, value){
        const d = format(value, 'dd/MM/yyyy');
        setFieldValue(key, d);
    }

    const [places, setPlaces] = useState(null);
    const [center, setCenter] = useState(null);

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

    useEffect(
        () => {
            if(center)
            {
                setFieldValue('location', center)
            }
        }, [center]
    );

    const[searchBox, setSearchBox] = useState(null);

    function searchBoxOnLoad (ref)
    {
      setSearchBox(ref);
    }

    function handlePlacesChanged(){
        setPlaces(searchBox.getPlaces());
    };

    const [update, setUpdate] = useState(false);
    const navigate = useNavigate();

    useEffect(
        () => {
            if(update){
                const gen = nanoid();
                const id = ownerID || gen;
                const docRef = doc(db, "oportunidades", id);
                const v = {...values};

                v.url = v.url.trim();

                // console.log(v);
                setDoc(docRef, v).then(navigate(`/oportunidades/${v.url}`));
                if(!ownerID){
                    setOwnerID(gen);
                }
                setUpdate(false);
            }
        }, [update]
    );

    function submitData(){
        let promisseList = [];
        imageList.forEach(
            (element, index) => {
                if(element.file){
                    const p = new Promise(
                        (resolve, reject) => {
                            const storageRef = ref(storage, `oportunidades-${values.url}/` + element.file.name);
                            const metadata = {
                                contentType: element.file.type,
                            };
                            uploadBytes(storageRef, element.file, metadata).then((snapshot) => {
                                getDownloadURL(snapshot.ref).then((downloadURL) => {
                                    setFieldValue('pic', downloadURL);                                  
                                    resolve(`${element.origin}-${element.index}`);          
                                  });
                              });
                        }
                    );
                    promisseList.push(p);
                }
            }
        );
        Promise.all(promisseList).then((val) => {
            resetImageList();
            setUpdate(true);
          });
    }


    function submitValues(key){
        if(!isURLAvailable) { return; }
        toggleEditingStateFor(key);
        handleSubmit();
    }

    function selectDropdown(index){
        const value = projetos[index];
        setFieldValue('ownerProj', value);
    }

    const [isURLAvailable , setIsURLAvailable] = useState(true);

    async function getURLAvailable(url){
        const q = query(collection(db, 'oportunidades'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || url === values?.url;
    }

    function checkForUniqueURL(e){
        getURLAvailable(e.target.value).then(
            (res) => {
                setIsURLAvailable(res);
            }
        )
    }

    useEffect(() => {
        if(!oportunidade && projetos && projetos.length > 0){
            selectDropdown(0);
        }
    }, [projetos, oportunidade]);

    const [oportunidades, setOportunidades] = useState(null);

    async function getOportunidades(){
        const querySnapshot = await getDocs(collection(db, "oportunidades"));
        let oportunidadesList = [];
        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        oportunidadesList.push(doc.data());
        });
        // tramposList = tramposList.filter((e) => e.owner !== ownerID);
        setOportunidades(oportunidadesList);
    }

    useEffect(
        () => {
            console.log(errors);
        },[errors]
    );

    
    async function deleteJob(){
        if(!ownerID) { return; }
        await deleteDoc(doc(db, "oportunidades", ownerID));
    }
    
  return(
    <VStack width={'full'}  px={{base:0, md:'100px'}} py={'28px'} spacing={'45px'}>
        <Grid
        w={'full'}
        templateRows='repeat(1, 1fr)'
        templateColumns='repeat(3, 1fr)'
        gap={4}
        >
            <GridItem rowSpan={2} colSpan={2}> 
                <VStack spacing={'10px'} w={'full'}>                               
                        <VStack w={'full'} bgColor={'#00A195'} boxShadow={'2xl'} minH={'560px'} px={'40px'} py={'23px'} spacing={'23px'}>
                            <Flex w={'full'} justifyContent={'space-between'}>                                    
                                {!editing['info']?
                                    values?.ownerProj?.name?
                                        <Heading fontSize={'40px'} fontWeight={'bold'}>{values.ownerProj.name}</Heading>
                                        : <Skeleton h={'32px'} w={'70%'} />                                    
                                    :
                                    projetos?
                                        <VStack>
                                            <FormControl isInvalid={errors.ownerProj}>
                                                <Select variant={'filled'} onChange={(e) => selectDropdown(e.target.value)} placeholder={values.ownerProj.name}>
                                                    {projetos.map(
                                                        (item, index) => {
                                                            return(
                                                                <option key={index} value={index}>{item.name}</option>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                                <FormHelperText>É necessário criar um projeto para inserir uma oportunidade</FormHelperText>
                                                <FormErrorMessage>{errors.ownerProj?.name}</FormErrorMessage>
                                            </FormControl>
                                            <FormControl isInvalid={errors.url || !isURLAvailable}>
                                                <Tooltip label='Escolha uma URL única para seu perfil' placement='bottom' isOpen={!isURLAvailable}>
                                                <InputGroup size='sm' >
                                                    <InputLeftAddon children={`sala33.com.br/oportunidades/`} />
                                                    <Input isInvalid={!isURLAvailable} onChange={handleChange}
                                                    onBlur={checkForUniqueURL} variant={'filled'}  id="url" value={values.url} placeholder={values.url} />
                                                </InputGroup>
                                                </Tooltip>
                                                <FormErrorMessage>{errors.url}</FormErrorMessage>
                                            </FormControl>
                                        </VStack>
                                    : null
                                }                                               
                            </Flex>
                            {!editing['info']?
                                <>
                                    <VStack spacing={'25px'} align={'start'} w={'full'}>
                                        <Text fontSize={'20px'} fontWeight={'bold'}>Sobre o Trabalho</Text>
                                        <Box w={'full'} bgColor={'#FFFFFF80'} minH={'170px'} p={'20px'}>
                                            {values?.about?
                                                <Text fontSize={'20px'} fontWeight={'600'}>{values.about}</Text>
                                                : 
                                                <Box>
                                                    <SkeletonText p={'10px'} mt='4' noOfLines={6} spacing='4' />
                                                </Box>
                                            }
                                        </Box>   
                                    </VStack>
                                    {values?.referencias.length > 0?
                                        <VStack w={'full'} spacing={'25px'} align={'start'}>
                                            <Text fontSize={'20px'} fontWeight={'bold'}>Referência</Text>
                                            <Box w={'full'} bgColor={'#FFFFFF80'} minH={'170px'} p={'20px'}>
                                                <VStack>
                                                    {values?.referencias?.map(
                                                            (item, index) => {
                                                                return(
                                                                    <Box key={index} w={'full'}>
                                                                        <Link  href={item} ><Text fontSize={'20px'} fontWeight={'600'}>{item}</Text></Link>
                                                                    </Box>
                                                                );
                                                            }
                                                        )
                                                    }
                                                </VStack>
                                            </Box>   
                                        </VStack>
                                        :
                                        <Box w={'full'}>
                                            <SkeletonText p={'10px'} mt='4' noOfLines={6} spacing='4' />
                                        </Box>
                                    }
                                    {produtora?
                                        <HStack w={'full'}>
                                            <HStack height={'full'} alignContent={'end'} justifyContent={'end'}>
                                                <Text as={'i'} fontWeight={400} color={'white'} fontSize={'20px'}>
                                                    Vaga criada pela produtora</Text>
                                                <Text fontWeight={'bold'} fontSize={'20px'}> {produtora.name}</Text>
                                                <Text as={'i'} fontWeight={'light'} fontSize={'13px'}>
                                                    {values?.dataCriacao}
                                                </Text>  
                                            </HStack>
                                        </HStack>
                                    : <Skeleton h={'32px'} w={'80%'} /> }          
                                </>
                            :                         
                                <VStack w={'full'}>
                                    <Box w={'full'}>
                                        <Text>Sobre o Trabalho</Text>
                                    </Box>
                                    <Textarea variant={'filled'} value={values.about}
                                    id="about" w={'full'} height={'200px'} onChange={handleChange}
                                    placeholder={values.about} />
                                    <Box w={'full'}>
                                            <Text>Referência</Text>
                                            <Box w={'full'} bgColor={'#FFFFFF80'}>
                                                <VStack>
                                                    {values?.referencias?.map(
                                                            (item, index) => {
                                                                return(
                                                                    <Box key={index} w={'full'}>
                                                                        <FormControl isInvalid={errors.referencias?.length > 0 && errors.referencias[index]}>
                                                                            <Input id={`referencias[${index}]`}
                                                                                onChange={handleChange} 
                                                                                placeholder={values.referencias[index]} 
                                                                                value={values.referencias[index]} />
                                                                            <FormErrorMessage>{errors.referencias?.length > 0 && errors.referencias[index]}</FormErrorMessage>
                                                                        </FormControl>
                                                                    </Box>
                                                                );
                                                            }
                                                        )
                                                    }
                                                </VStack>
                                            </Box>   
                                        </Box>
                                    {values.referencias?.length < 5?
                                            <Button onClick={addFieldForLinks} size={'sm'}><AddIcon /></Button>
                                        : null
                                    }
                                </VStack> 
                            }                            
                        </VStack>
                    {!editing['info']? 
                        values?.embed?
                            <VStack w={'full'} bgColor={'#00A195'} h={'600px'}>
                                    <Box w={'full'} h={'full'} dangerouslySetInnerHTML={{__html: values.embed}} />
                            </VStack>
                                :
                                    <Box w={'full'}>
                                        <SkeletonText p={'10px'} mt='4' noOfLines={6} spacing='4' />
                                    </Box>                       
                        :
                            <VStack w={'full'} bgColor={'#00A195'} h={'600px'}>
                                <Textarea variant={'filled'} value={values.embed}
                                id="about" w={'full'} height={'200px'} onChange={handleChange}
                                placeholder={values.embed} />
                            </VStack>
                        }
                </VStack>
            </GridItem>
            <GridItem rowSpan={1} colSpan={1} bg='#00A195'>
            {values?.owner === user?.uid && userData && userData?.userType === 'produtora'? 
                <HStack w={'full'} p={'8px'}>
                    {editing['info']?
                        <HStack w={'full'}>
                            <Button size={'sm'} colorScheme={'red'} onClick={() => toggleEditingStateFor('info')}>Cancelar</Button>
                            <Button size={'sm'} colorScheme={'blue'} onClick={() => submitValues('info')} disabled={!isValid}>Salvar</Button>
                            <Spacer />
                            {ownerID?
                                <Button colorScheme={'red'} onClick={deleteJob}>Excluir</Button>
                                :null }
                        </HStack>
                        : 
                        <Button size={'sm'} onClick={() => toggleEditingStateFor('info')}><EditIcon /></Button>    
                    } 
                </HStack>
            : null}
            {!editing['info']? 
                <VStack spacing={'20px'} py={'10px'}>
                    {values?.Title?
                        <Heading fontSize={'40px'} fontWeight={'bold'}>{values.Title}</Heading>
                        : <Skeleton h={'32px'} w={'80%'} />
                    }
                    {values?.pic?
                        <Image boxShadow={'dark-lg'} src={values.pic} fallbackSrc={"https://via.placeholder.com/350x300"} />
                        : <Skeleton h={'300px'} w={'350px'} />
                    }
                    <Text as={'i'} fontSize={'17px'} fontWeight={'light'}>Acordo firmado entre as partes através de contrato!</Text>
                    <Box>
                        {values?.inicio?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Inicio:</Text>
                                <Text fontWeight={'bold'} fontSize={'20px'} color={'white'}> {values.inicio}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.termino?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Termino:</Text>
                                <Text fontWeight={'bold'} fontSize={'20px'} color={'white'}> {values.termino}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                    </Box>
                    <Stack w={'full'} px={'40px'} align={'start'} >
                        {values?.habilidades?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Habilidades:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.habilidades}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.idioma?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Idioma:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.idioma}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.modelo?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Modelo de Trabalho:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.modelo}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.categoria?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Categoria:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.categoria}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.orcamento?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Orçamento:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.orcamento}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.pagamento?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Pagamento:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.pagamento}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.contratacao?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Contratação:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.contratacao}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.comunicacao?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Comunicação:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.comunicacao}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                        {values?.ferramentas?
                            <HStack>
                                <Text fontWeight={'bold'} fontSize={'20px'}>Ferramenta de Gestão:</Text>
                                <Text fontWeight={'regular'} fontSize={'20px'} color={'white'}> {values.ferramentas}</Text>    
                            </HStack>
                            : <Skeleton h={'32px'} w={'80%'} />
                        }
                    </Stack>
                </VStack>
            : 
                <VStack px={'30px'} py={'20px'}>
                    <FormControl isInvalid={errors.Title}>
                        <InputGroup size='sm' >
                            <InputLeftAddon children='Título' />
                            <Input onChange={handleChange} id="Title" value={values.Title} placeholder={values.Title} />
                        </InputGroup>
                        <FormErrorMessage>{errors.Title}</FormErrorMessage>
                    </FormControl>
                    <VStack w={'full'}>
                        <Box width={'full'}>
                            <Button padding={0} size={'sm'} 
                                colorScheme={'whiteAlpha'} position={'relative'}
                                left={'70px'} bottom={'-50px'} zIndex={2} 
                                onClick={() => inputRef.current.click()}>
                                <EditIcon />
                            </Button>   
                        </Box> 
                        <Image src={getSrc('avatar', 0)} fallbackSrc={'https://via.placeholder.com/350x300'} />
                        <Input type={'file'} hidden ref={inputRef} onChange={(e)=>{addImage(e.target.files[0], 'avatar', 0)}} />                                
                    </VStack>                       
                    <Text>Acordo firmado entre as partes através de contrato!</Text>
                    <HStack>
                        <Text>Inicio: </Text> 
                            <DatePicker 
                            selected={getDateFromString(values.inicio)} 
                            onChange={(date) => setStringDate('inicio', date)} 
                            dateFormat="dd/MM/yyyy"
                            customInput={<DatePickerCustom />}
                            />
                    </HStack>
                    <HStack>
                        <Text>Termino: </Text>
                        <DatePicker 
                        selected={getDateFromString(values.termino)} 
                        onChange={(date) => setStringDate('termino', date)} 
                        dateFormat="dd/MM/yyyy"
                        customInput={<DatePickerCustom />}
                        /> 
                    </HStack>
                    <Stack w={'full'} >
                        <FormControl isInvalid={errors.habilidades}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Habilidades' />
                                <Input onChange={handleChange} variant={'filled'}  id="habilidades" value={values.habilidades} placeholder={values.habilidades} />
                            </InputGroup>
                            <FormErrorMessage>{errors.habilidades}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.idioma}>
                            <InputGroup size='sm' >
                                    <InputLeftAddon children='Idioma' />
                                    <Input onChange={handleChange} variant={'filled'} id="idioma" value={values.idioma} placeholder={values.idioma} />
                            </InputGroup>
                            <FormErrorMessage>{errors.idioma}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.modelo}>
                            <InputGroup size='sm' >
                                    <InputLeftAddon children='Modelo' />
                                    <Input onChange={handleChange} variant={'filled'} id="modelo" value={values.modelo} placeholder={values.modelo} />
                            </InputGroup>
                            <FormErrorMessage>{errors.modelo}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.categoria}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Categoria' />
                                <Input onChange={handleChange} variant={'filled'} id="categoria" value={values.categoria} placeholder={values.categoria} />
                            </InputGroup>
                            <FormErrorMessage>{errors.categoria}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.orcamento}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Orçamento' />
                                <Input onChange={handleChange} variant={'filled'} id="orcamento" value={values.orcamento} placeholder={values.orcamento} />
                            </InputGroup>
                            <FormErrorMessage>{errors.orcamento}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.pagamento}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Pagamento' />
                                <Input onChange={handleChange} variant={'filled'} id="pagamento" value={values.pagamento} placeholder={values.pagamento} />
                            </InputGroup>
                            <FormErrorMessage>{errors.pagamento}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.contratacao}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Contratação' />
                                <Input onChange={handleChange} variant={'filled'} id="contratacao" value={values.contratacao} placeholder={values.contratacao} />
                            </InputGroup>
                            <FormErrorMessage>{errors.contratacao}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.comunicacao}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Comunicação' />
                                <Input onChange={handleChange} variant={'filled'} id="comunicacao" value={values.comunicacao} placeholder={values.comunicacao} />
                            </InputGroup>
                            <FormErrorMessage>{errors.comunicacao}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={errors.ferramentas}>
                            <InputGroup size='sm' >
                                <InputLeftAddon children='Ferramentas' />
                                <Input onChange={handleChange} variant={'filled'} id="ferramentas" value={values.ferramentas} placeholder={values.ferramentas} />
                            </InputGroup>
                            <FormErrorMessage>{errors.ferramentas}</FormErrorMessage>
                        </FormControl>
                    </Stack>
                </VStack>}
            </GridItem>
            <GridItem rowSpan={1} colSpan={1}>
                <Box>
                    <LoadScript id="script-loader" googleMapsApiKey={process.env.REACT_APP_API_GOOGLE_API} libraries={libraries}>
                        {editing['info']
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
                                zoom={15}
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
                </Box>
            </GridItem>
            <GridItem rowSpan={1} colSpan={3} bgColor={'#FDD07A29'} w={'full'} px={'80px'} pb={'80px'} pt={'15px'}>
                <VStack spacing={'30px'}>
                    <Heading>Outras Oportunidades</Heading>
                    {oportunidades?.length > 0?
                        <SliderCarousel oportunidades={oportunidades} />
                    : null}
                </VStack>
            </GridItem>
        </Grid>
    </VStack>
  );
};

export default OportunitiesPage;


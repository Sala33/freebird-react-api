import { AddIcon, DeleteIcon, PhoneIcon } from "@chakra-ui/icons";
import { Box, Button, Center, FormControl, FormErrorMessage, FormHelperText, Heading, HStack, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spacer, Tabs, Text, Textarea, Tooltip, VStack, Wrap, WrapItem } from "@chakra-ui/react";
import { format } from "date-fns";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useFormik } from "formik";
import { nanoid } from "nanoid";
import { forwardRef, useEffect, useState } from "react";
import { db, storage } from "../../utils/firebase";
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { categorias } from "../../utils/categorias";
import * as Yup from 'yup';
import { useMutation } from "react-query";
import ReactInputMask from "react-input-mask";

const customStyles = {
    menu: (provided, state) => ({
        ...provided,
        width: 400,
      }),
    control: (provided) => ({
        ...provided,
    // none of react-select's styles are passed to <Control />
    width: 400,
    }),
    option: (provided, state) => ({
    ...provided,
    width: 400,
    }),
}

const EditModal = ({isOpen, onClose, projeto, ownerID, userGuid}) => {

    const [owner, setOwner] = useState(null);
    const [update, setUpdate] = useState(false);

    useEffect(
        () => {
            if(ownerID){
                setOwner(ownerID);
            } else if( isOpen && !ownerID){
                setOwner(nanoid());
            }
        },[isOpen,ownerID]
    );

    useEffect(
        () => {
            if(owner){
                console.log(owner);
            }
        },[owner]
    );

    useEffect(
        () => {
            if(update){
                const id = owner || nanoid();
                const docRef = doc(db, "projetos", id);
                const v = {...values};

                v.media = v.media?.filter((entry) => { return entry.trim() !== ''; });
                v.imprensa = v.imprensa?.filter((entry) => { return entry.title.trim() !== ''; });
                v.ficha = v.ficha?.filter((entry) => { return entry.participantes !== 'undefined'; });
                v.apoiadores = v.apoiadores?.filter((entry) => { return entry.trim() !== ''; });
    
                setDoc(docRef, {...values});
                setUpdate(false);
                onClose(v);
            }
        }, [update]
    );

    const SignupSchema = Yup.object().shape({
        main: Yup.array(Yup.string().required('Adicione até 3 imagens.'))
            .max(3, 'Mais de três imagens encontradas')
            .notRequired('Ao menos uma imagem deve ser fornecida'),
        apoiadores: Yup.array().min(0).max(10),
        imprensa: Yup.array(Yup.object().shape(
            {   data: Yup.string().required('Coloque a data de publicação do Jornal'),
                jornal: Yup.string().required('Coloque o nome do Jornal'),
                title: Yup.string().required('Coloque o título da reportagem'),
                pic: Yup.string().notRequired().default(''),
                url: Yup.string().notRequired().default('')
            })).notRequired(),
        ficha: Yup.array(Yup.object().shape({
            cargo: Yup.string().required('Adicione um cargo').default(''),
            participantes: Yup.array().min(1, 'Adicione ao menos um participante').required()
        })),
        media: Yup.array(Yup.string().url('Deve ser um link válido de Youtube, Twitch ou Soundcloud').required('Adicione até 4 links de media.'))
            .max(4, 'Mais de quatro links encontrados')
            .notRequired('Ao menos uma imagem deve ser fornecida'),
        name: Yup.string().min(2, 'Verifique o nome do Projeto').max(50, 'Nome do Projeto muito longo!').required('Nome do Projeto requerido!'),
        owner: Yup.string().required('Não foi possível associar o id ao usuário').default(userGuid),
        regua: Yup.string().notRequired(),
        sinopse: Yup.string().max(1500, 'Sinopse muito longa!').required('Sinopse é obrigatória!'),
        url: Yup.string().required('A url é obrigatória na criação'),
        apresentacao: Yup.string().max(500, 'Apresentação muito longa!').required('Apresentação é obrigatória!'),
        sinopseTitle: Yup.string().max(250, 'Título para Sinopse muito longa!').required('Título para sinopse é obrigatória!'),
        data: Yup.string().notRequired(),
        tags: Yup.array(Yup.string().required('Forneça até 5 tags')).min(1, 'Forneça Tags').max(5, 'Muitas Tags').required('Adicione Tags'),
        externalLink: Yup.string().url().typeError('Deve ter o formato de um Link'),
        contact: Yup.string().required('O Contato é obrigatório'),
      });

    const initialData = {
        main: [],
        apoiadores: [],
        imprensa: [{data: format(Date.now(), 'dd/MM/yyyy'), jornal: '', pic: '', title: '', url: ''}],
        ficha: [{cargo: '', participantes: []}],
        media: [],
        name: '',
        owner: userGuid,
        regua: '',
        sinopse: '',
        url: '',
        apresentacao: '',
        data: format(Date.now(), 'dd/MM/yyyy'),
        tags: [],
        previewPic: '',
        sinopseTitle: '',
        externalLink: '',
        contact: ''
    }

    const { handleChange, values, setFieldValue, 
        handleSubmit, setValues, isValid,
        errors, touched } = useFormik({
        validateOnBlur: true,
        validationSchema: SignupSchema,
        initialValues: {
            ...projeto
        },
        onSubmit: values => {
            // setUpUploadData();
            uploadData();
        },
        enableReinitialize: true,
    });

    const updateProject = useMutation(
        () => {
            const id = owner;
            const docRef = doc(db, "projetos", id);
            const v = {...values};
    
            v.media = v.media?.filter((entry) => { return entry.trim() !== ''; });
            v.imprensa = v.imprensa?.filter((entry) => { return entry.title.trim() !== ''; });
            v.ficha = v.ficha?.filter((entry) => { return entry.participantes !== 'undefined'; });
            v.apoiadores = v.apoiadores?.filter((entry) => { return entry.trim() !== ''; });

            setDoc(docRef, {...values});
        },
        {
            onSuccess: (data, variables, context) => {
               onClose();
            },
            onError: (error, variables, context) => {
                // An error happened!
                console.log(error);
              },
        }
    );

    function uploadData(){
        updateProject.mutate();
    };

    const [users, setUsers] = useState([]);

    async function getUserData(){
        const querySnapshot = await getDocs(collection(db, "users"));
        let userList = [];
        querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const label = {
            value: doc.data(),
            label: doc.data().name,
        }
        userList.push(label);
        });
        setUsers(userList);
    }
    const [apoiadores, setApoiadores] = useState([]);

    const setUpImageList = () => {
        let imgList = [];
            projeto.main?.forEach(
                (element, index) => {
                    imgList.push(
                        {
                            dataUrl: element,
                            file: null,
                            origin: 'main',
                            index: index,
                        }
                    );
                }
            );
            projeto.apoiadores.forEach(
                (element, index) => {
                    imgList.push(
                        {
                            dataUrl: element,
                            file: null,
                            origin: 'apoiadores',
                            index: index,
                        }
                    );
                }
            );
            projeto.imprensa.forEach(
                (element, index) => {
                    imgList.push(
                        {
                            dataUrl: element.pic,
                            file: null,
                            origin: 'imprensa',
                            index: index,
                        }
                    );
                }
            );
            imgList.push(
                {
                        dataUrl: projeto.regua,
                        file: null,
                        origin: 'regua',
                        index: null,
                    }
                );          
            imgList.push(
                {
                        dataUrl: projeto.previewPic,
                        file: null,
                        origin: 'preview',
                        index: null,
                    }
                );          
            setImageList(imgList);
    }

    useEffect(
        () => {
            if(isOpen){
                getUserData();
                getApoiadores();
                if(projeto){
                    setUpImageList();
                } else{
                    setValues(initialData);
                }
            }
        },[isOpen]
    );

    async function getApoiadores(){
        const querySnapshot = await getDocs(collection(db, "apoiadores"));
        let apoiadoresList = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const apoiador = {
                nome: doc.id,
                logo: doc.data().logo
            }
            apoiadoresList.push(apoiador);
        });
        setApoiadores(apoiadoresList);
    }

    // useEffect(
    //     () => {
    //         if(values){
    //             console.log(values);
    //         }
    //     },[values]
    // );

    const handleMultiChange = (
        newValue,
        actionMeta,
        index,
      ) => {
        // console.group('Value Changed');
        // console.log(newValue);
        // console.log(newValue);
        const arr = [];
        newValue.forEach(
            e => {
                const p = {label: e.label, value: e.value};
                arr.push(p);
            }
        );
        
        setFieldValue(`ficha[${index}].participantes`, arr);
        // console.log(`action: ${actionMeta.action}`);
        // console.groupEnd();
      };


    function getDateFromString(dateString){
        var date= dateString.split("/");
        var f = new Date(date[2], date[1] -1, date[0]);
        return f;
    }

    function setArticleDate(index, value){
        const d = format(value, 'dd/MM/yyyy');
        setFieldValue(`imprensa[${index}].data`, d);
    }
    function setProjetoDate(value){
        const d = format(value, 'dd/MM/yyyy');
        setFieldValue(`data`, d);
    }

    const DatePickerCustom = forwardRef(({ value, onClick }, ref) => (
        <Button size={'sm'} className="example-custom-input" onClick={onClick} ref={ref}>
          {value}
        </Button>
    ));

    function addNewFicha(){
        setFieldValue('ficha',[...values.ficha, {cargo: '', participantes: []}]);
    }

    function addNewMedia(){
        setFieldValue('media',[...values.media, '']);
    }
    function addNewReportagem(){
        setFieldValue('imprensa',[...values.imprensa, {data: format(Date.now(), 'dd/MM/yyyy'), jornal: '', pic: '', title: '', url: ''}]);
    }
    function addNewApoiador(){
        setFieldValue('apoiadores',[...values.apoiadores, ' ']);
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

        result.push(img);
        setImageList(result);
    }

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
          arr.splice(index, 1);
        }
        return arr;
    };

    function removeImage(key, index){
        const cp = [...imageList];
        const result = cp.filter(i => (!(i.origin === key && i.index === index)));

        if(!result){return;}
        const f = removeItemOnce(cp, result[0]);
        setImageList(f);

        // console.log(f);
        
        let fieldCP = [];
        if(key=== 'apoiadores'){
            fieldCP = [...values.apoiadores];
        }

        fieldCP.splice(index, 1);
        setFieldValue(key, [...fieldCP]);
    }

    function getSrc(key, index){
        // const cp = [...imageList];
        // const result = cp.filter(i => (i.origin === key && i.index === index));

        return values?.main[index] ?? 'https://via.placeholder.com/1520x580';
    }

    function apoiadoresSrc(key, index){
        // const cp = [...imageList];
        // const result = cp.filter(i => (i.origin === key && i.index === index));

        return values?.apoiadores[index] ?? 'https://via.placeholder.com/375x100';
    }

    function imprensaSrc(key, index){
        // const cp = [...imageList];
        // const result = cp.filter(i => (i.origin === key && i.index === index));

        return values?.imprensa[index]?.pic ?? 'https://via.placeholder.com/150x100';
    }

    function removeFichaAt(index){
        const cp = [...values.ficha];
        cp.splice(index, 1);
        setFieldValue('ficha', cp);
    }
    function removeImprensaAt(index){
        const cp = [...values.imprensa];
        cp.splice(index, 1);
        setFieldValue('imprensa', cp);
    }

    const [isURLAvailable , setIsURLAvailable] = useState(true);

    async function getURLAvailable(url){
        const q = query(collection(db, 'projetos'), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || url === projeto?.url;
    }

    function checkForUniqueURL(e){
        getURLAvailable(e.target.value).then(
            (res) => {
                setIsURLAvailable(res);
            }
        )
    }

    function setTags(values){
        const tags = [];
        values.forEach(
            e => {
                tags.push(e.value);
            }
        )
        setFieldValue('tags', tags);
    }

    function getTags(){
        const tags = [];
        if(!projeto?.tags){
            return null;
        }
        projeto.tags?.forEach(
            e => {
                const found = categorias.find(ele => ele.value === e)
                if(found){
                    tags.push(found);
                }
            }
        )
        return tags;
    }


    const updateFieldMutation = useMutation(
        (field) => {
            if(!owner){ return; }
            const userRef = doc(db, 'projetos', owner);
            // Set the 'capital' field of the city
            return setDoc(userRef, {...field}, { merge: true });
        },
        {
            onSuccess: (data, variables, context) => {
               console.log('success ProfilePic');
            },
        }
    );

    const bannerPicMutation = useMutation(
        ({file, index}) => {
            const storageRef = ref(storage, `projetos-banner/${owner}-${index}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue(`main[${variables.index}]`, url);
                        const p = [...values.main];
                        p[variables.index] = url;
                        const field = {main: p};
                        updateFieldMutation.mutate(field);
                    }
                );         
            },
        }
    );

    const apoiadorPicMutation = useMutation(
        ({file, index}) => {
            const storageRef = ref(storage, `projetos-apoiadores/${owner}-${index}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue(`apoiadores[${variables.index}]`, url);
                        const p = [...values.apoiadores];
                        p[variables.index] = url;
                        const field = {apoiadores: p};
                        updateFieldMutation.mutate(field);
                    }
                );         
            },
        }
    );

    const imprensaPicMutation = useMutation(
        ({file, index}) => {
            const storageRef = ref(storage, `projetos-imprensa/${owner}-${index}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue(`imprensa[${variables.index}].pic`, url);
                        const p = [...values.imprensa];
                        let t = p[variables.index];
                        if(t){
                            t.pic = url;
                        }
                        else{
                            t = {pic: url}
                        }
                        const field = {imprensa: p};
                        updateFieldMutation.mutate(field);
                    }
                );         
            },
        }
    );

    const previewPicMutation = useMutation(
        (file) => {
            const storageRef = ref(storage, `projetos-preview/${owner}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue(`preview`, url);
                        const field = {preview: url};
                        updateFieldMutation.mutate(field);
                    }
                );         
            },
        }
    );

    const reguaPicMutation = useMutation(
        (file) => {
            const storageRef = ref(storage, `projetos-regua/${owner}.${file.name.split('.').pop()}`);

            const metadata = {
                contentType: file.type,
            };
    
            return uploadBytes(storageRef, file, metadata);
        },
        {
            onSuccess: (data, variables, context) => {
                getDownloadURL(data.ref).then(
                    (url) => {
                        setFieldValue(`regua`, url);
                        const field = {regua: url};
                        updateFieldMutation.mutate(field);
                    }
                );         
            },
        }
    );

    async function uploadBanner(file, index){

        if(!owner) { return; }

        const p = {file: file, index: index};

        bannerPicMutation.mutate(p);
    };

    async function uploadApoiador(file, index){

        if(!owner) { return; }

        const p = {file: file, index: index};

        apoiadorPicMutation.mutate(p);
    };

    async function uploadImprensa(file, index){

        if(!owner) { return; }

        const p = {file: file, index: index};

        imprensaPicMutation.mutate(p);
    };

    async function uploadPreview(file){

        if(!owner) { return; }

        previewPicMutation.mutate(file);
    };

    async function uploadRegua(file){

        if(!owner) { return; }

        reguaPicMutation.mutate(file);
    };

    useEffect(
        () => {
            console.log(errors);
        }, [errors]
    );

    return(
    <Modal isOpen={isOpen} onClose={onClose} size={'full'}>
        <ModalOverlay />
        <ModalContent>
        <ModalHeader>Editar Projeto</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
            <VStack width={'full'} px={'60px'} spacing={'15px'}>
                <Heading>Imagens para Banner</Heading>
                {values.main?
                    // write your building UI
                    <HStack p={'10px'} bgColor={'blackAlpha.100'}>
                        {[...Array(3)].map(
                            (item, index) => {
                                return(
                                    <VStack key={index}>
                                        <Image bgSize={'cover'} bgPosition={'center'} w={'200px'} h={'76px'} bgImage={getSrc('main', index)} />
                                        <Box w={'120px'} h={'100px'}>
                                        <Input type={'file'} onChange={(e)=>{uploadBanner(e.target.files[0], index)}} />
                                        </Box>
                                    </VStack>
                                );
                            }
                        )}
                    </HStack>
                    : null
                }
                <VStack w={'full'} p={'10px'} bgColor={'blackAlpha.100'}>
                    <VStack>
                        <FormControl isInvalid={errors.apresentacao}>
                            <FormHelperText>Esta imagem será mostrada nos previews do projeto.</FormHelperText>
                                <Heading>Imagem de Preview:</Heading>
                                <Spacer />
                                <Box bgSize={'cover'} bgPosition={'center'} w={'350px'} h={'200px'}
                                    bgImage={values?.preview || 'https://via.placeholder.com/350x200'} />
                                <Box w={'120px'} h={'100px'}>
                                    <Input type={'file'} onChange={(e)=>{uploadPreview(e.target.files[0])}} />
                                </Box>
                        </FormControl>
                    </VStack>
                    <VStack w={'70%'} h={'200px'}>
                        <Heading>Apresentação:</Heading>
                        <Spacer />
                        <FormControl isInvalid={errors.apresentacao}>
                            <Textarea variant={'filled'} value={values.apresentacao}
                            id="apresentacao" w={'full'} height={'100px'} onChange={handleChange}
                            placeholder={values.apresentacao} />
                            <FormErrorMessage>{errors.apresentacao}</FormErrorMessage>
                            <FormHelperText>A apresentação será mostrada nos previews do projeto.</FormHelperText>
                        </FormControl>
                    </VStack>
                </VStack>
                <Spacer />
                <FormControl isInvalid={errors.name} >
                    <InputGroup size='sm' >
                        <InputLeftAddon children='Titulo' />
                        <Input
                            onChange={handleChange}
                            id={'name'}
                            placeholder={values.name} value={values.name} />
                    </InputGroup>
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.url || !isURLAvailable}>
                    <Tooltip label='Escolha uma URL única para seu projeto' placement='bottom' isOpen={!isURLAvailable}>
                        <InputGroup size='sm' >
                            <InputLeftAddon children='sala33.com.br/projetos/' />
                            <Input onChange={handleChange} onBlur={checkForUniqueURL}
                                id={'url'}
                                placeholder={values.url} value={values.url} />
                        </InputGroup>
                    </Tooltip>
                    <FormErrorMessage>{errors.url}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.externalLink}>
                        <InputGroup size='sm' >
                            <InputLeftAddon children='Link Externo' />
                            <Input onChange={handleChange}
                                id={'externalLink'}
                                placeholder={'Link Externo para Acesso'} value={values.externalLink} />
                        </InputGroup>
                    <FormErrorMessage>{errors.externalLink}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.contact}>
                    <InputGroup w={'200px'}>
                        <InputLeftElement
                        pointerEvents='none'
                        children={<PhoneIcon color='gray.300' />}
                            />
                        <Input
                        as={ReactInputMask} mask="(**) *****-****" maskChar={null}
                        onChange={handleChange} variant={'filled'} 
                        id='contact' placeholder={values?.contact} value={values?.contact} />
                    </InputGroup> 
                    <FormErrorMessage>{errors.contact}</FormErrorMessage>
                </FormControl>  
                {values?.data?
                    <HStack whiteSpace={'nowrap'} w={'full'} align={'start'}>
                        <Text>Data de Entrega:</Text>
                        <DatePicker 
                        selected={getDateFromString(values.data)} 
                        onChange={(date) => setProjetoDate(date)} 
                        dateFormat="dd/MM/yyyy"
                        customInput={<DatePickerCustom />}
                        />
                    </HStack>
                : null}
                <Heading>Tags:</Heading>
                <Center>
                    <FormControl isInvalid={errors.tags}>
                        <Select
                            defaultValue={getTags}
                            isMulti
                            styles={customStyles}
                            onChange={(newValue, actionMeta) => setTags(newValue)}
                            name="colors"
                            options={categorias}
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                        <FormErrorMessage>{errors.tags}</FormErrorMessage>
                    </FormControl>
                </Center>
                <Heading>Título para Sinopse:</Heading>
                <FormControl isInvalid={errors.sinopseTitle}>
                    <Textarea variant={'filled'} value={values.sinopseTitle}
                    id="sinopseTitle" w={'full'} height={'50px'} onChange={handleChange}
                    placeholder={'Título para a Sinopse que irá aparecer nas páginas de preview.'} />
                    <FormErrorMessage>{errors.sinopseTitle}</FormErrorMessage>
                </FormControl>
                <Heading>Sinopse:</Heading>
                <FormControl isInvalid={errors.sinopse}>
                    <Textarea variant={'filled'} value={values.sinopse}
                    id="sinopse" w={'full'} height={'200px'} onChange={handleChange}
                    placeholder={values.sinopse} />
                    <FormErrorMessage>{errors.sinopse}</FormErrorMessage>
                </FormControl>
                <VStack w={'full'} p={'10px'} bgColor={'blackAlpha.100'}>
                    <Heading>Media:</Heading>
                        {values.media?.map(
                            (item, index) => {
                                return(
                                    <FormControl isInvalid={errors.media?.length > 0 && errors.media[index]}>
                                        <Input
                                            key={index}
                                            w={'full'}
                                            onChange={handleChange}
                                            id={`media[${index}]`}
                                            placeholder={item}
                                            value={item} />
                                        <FormErrorMessage>{errors.media?.length > 0 && errors.media[index]}</FormErrorMessage>
                                 </FormControl>                                  
                                );
                            }
                        )}
                    {values.media?.length < 5?
                            <Button onClick={addNewMedia} size={'sm'}><AddIcon /></Button>
                        : null
                    }
                </VStack>
                <VStack w={'full'} p={'10px'} bgColor={'blackAlpha.100'}>
                    <Heading>Ficha Tecnica:</Heading>
                    <Wrap>
                        {values.ficha?.map(
                            (item, index) => {
                                return(
                                    <WrapItem key={index}>
                                        <VStack w={'full'}  align={'start'}>
                                            <FormControl isInvalid={errors.ficha?.length > 0 && errors.ficha[index]?.cargo} w={'100%'}>
                                                <InputGroup size='sm' >
                                                    <InputLeftAddon children='Cargo' />
                                                    <Input
                                                        onChange={handleChange}
                                                        variant={'filled'}
                                                        bgColor={'white'}
                                                        id={`ficha[${index}].cargo`}
                                                        placeholder={values.ficha[index].cargo} value={values.ficha[index].cargo} />
                                                </InputGroup>
                                                <FormErrorMessage>{errors.ficha?.length > 0 && errors.ficha[index]?.cargo}</FormErrorMessage>
                                            </FormControl>  
                                            {item.participantes?
                                                <HStack width={'full'}>
                                                        <FormControl isInvalid={errors.ficha?.length > 0 && errors.ficha[index]?.participantes} w={'30%'}>
                                                            <HStack>
                                                                <CreatableSelect
                                                                    key={`creatable-${index}`}
                                                                    styles={customStyles}
                                                                    isMulti
                                                                    onChange={(newValue, actionMeta) => handleMultiChange(newValue, actionMeta, index)}
                                                                    options={users}
                                                                    value={item.participantes !== 'undefined'? item.participantes : null}
                                                                    />
                                                                <Button colorScheme={'red'} onClick={() => removeFichaAt(index)}><DeleteIcon /></Button>
                                                            </HStack>
                                                            <FormErrorMessage>{errors.ficha?.length > 0 && errors.ficha[index]?.participantes}</FormErrorMessage>
                                                        </FormControl>  
                                                </HStack>
                                                : null
                                            }
                                        </VStack>
                                    </WrapItem>
                                );
                            }
                        )}
                    </Wrap>
                    <Button onClick={addNewFicha} size={'sm'}><AddIcon /></Button>               
                </VStack>
                {values.imprensa?
                    <VStack p={'10px'} bgColor={'blackAlpha.100'}
                    spacing={'45px'}
                    width={'full'}
                    minHeight={'315px'}
                    bgRepeat={'no-repeat'}
                    bgPos={'right top'}>
                        <Center>
                            <Heading fontWeight={'extrabold'} fontSize={'25px'}>IMPRENSA</Heading>
                        </Center>
                            {values.imprensa.map(
                                (item, index) => {
                                    return(
                                        <HStack key={index} w={'full'}>
                                            <VStack>
                                            <Box bgRepeat={'no-repeat'} 
                                                    h={'100px'} w={'150px'} bgSize={'contain'} bgPosition={'center'} bgImage={imprensaSrc('imprensa', index)} />
                                                <Box w={'120px'} h={'100px'}>
                                                <Input type={'file'} onChange={(e)=>{uploadImprensa(e.target.files[0], index)}} />
                                                </Box>
                                            </VStack>
                                            {item.pic?
                                                <Box w={'2px'} h={'80px'} bgColor={'black'} />
                                                : null
                                            }
                                            <VStack w={'full'} px={'17px'} align={'start'}>
                                                <FormControl isInvalid={errors.imprensa?.length > 0 && errors.imprensa[index]?.url} w={'30%'}>
                                                    <InputGroup size='sm' >
                                                        <InputLeftAddon children='Endereço Artigo' />
                                                        <Input id={`imprensa[${index}].url`} onChange={handleChange} value={item.url} placeholder={item.url} />
                                                    </InputGroup>
                                                    <FormErrorMessage>{errors.imprensa?.length > 0 && errors.imprensa[index]?.url}</FormErrorMessage>
                                                </FormControl>  
                                                <FormControl isInvalid={errors.imprensa?.length > 0 && errors.imprensa[index]?.title} w={'30%'}>
                                                    <InputGroup size='sm' >
                                                        <InputLeftAddon children='Titulo Artigo' />
                                                        <Input id={`imprensa[${index}].title`} onChange={handleChange} value={item.title} placeholder={item.title} />
                                                    </InputGroup>
                                                    <FormErrorMessage>{errors.imprensa?.length > 0 && errors.imprensa[index]?.title}</FormErrorMessage>
                                                </FormControl>  
                                                                                            
                                                <HStack>
                                                    {item.data?
                                                        <DatePicker 
                                                        selected={getDateFromString(item.data)} 
                                                        onChange={(date) => setArticleDate(index, date)} 
                                                        dateFormat="dd/MM/yyyy"
                                                        customInput={<DatePickerCustom />}
                                                        />
                                                        : null
                                                    }
                                                    <Button colorScheme={'red'} onClick={() => removeImprensaAt(index)}><DeleteIcon /></Button>
                                                </HStack>
                                                <FormControl isInvalid={errors.imprensa?.length > 0 && errors.imprensa[index]?.jornal} w={'30%'}>
                                                    <InputGroup size='sm' >
                                                        <InputLeftAddon children='Nome do Jornal' />
                                                        <Input id={`imprensa[${index}].jornal`} onChange={handleChange} value={item.jornal} placeholder={item.jornal} />
                                                    </InputGroup>
                                                    <FormErrorMessage>{errors.imprensa?.length > 0 && errors.imprensa[index]?.jornal}</FormErrorMessage>
                                                </FormControl>  
                                            </VStack>
                                        </HStack>
                                    );
                                }
                            )}
                        {values.media?.length < 20?
                                <Button onClick={addNewReportagem} size={'sm'}><AddIcon /></Button>
                            : null
                        }
                    </VStack>
                : null}
                    <VStack p={'10px'} bgColor={'blackAlpha.100'}>
                    {values.apoiadores && apoiadores?
                        <VStack>
                            <Heading>Apoiadores:</Heading>
                            <HStack>
                                {values.apoiadores.map(
                                    (item, index) => {
                                        return(
                                            <VStack key={index}>
                                                <Box bgRepeat={'no-repeat'} 
                                                    h={'100px'} w={'150px'} bgSize={'contain'} bgPosition={'center'} bgImage={apoiadoresSrc('apoiadores', index)} />
                                                <HStack>
                                                    <Box w={'120px'} h={'100px'}>
                                                        <Input type={'file'} onChange={(e)=>{uploadApoiador(e.target.files[0],index)}} />
                                                    </Box>
                                                    <Button colorScheme={'red'} onClick={() => removeImage('apoiadores', index)}><DeleteIcon /></Button>
                                                </HStack>
                                            </VStack>
                                        );
                                    }
                                )}                            
                            </HStack>
                        </VStack>
                        : null
                    }
                    {
                    values.apoiadores?.length < 10?
                        <Button onClick={addNewApoiador} size={'sm'}><AddIcon /></Button>
                                : null
                    }
                </VStack>
                <VStack p={'10px'} bgColor={'blackAlpha.100'}>
                    <Heading>Regua:</Heading>
                    <Box bgRepeat={'no-repeat'} 
                        h={'115px'} w={'1200px'} bgSize={'contain'} bgPosition={'center'} bgImage={values?.regua || 'https://via.placeholder.com/1200x115'} />
                    <Box w={'120px'} h={'100px'}>
                        <Input type={'file'} onChange={(e)=>{uploadRegua(e.target.files[0])}} />
                    </Box>
                </VStack>
            </VStack>
        </ModalBody>

        <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={() =>onClose(null)}>
                Cancelar
            </Button>
            <Button colorScheme='green' onClick={handleSubmit} disabled={!isValid}>Salvar</Button>
        </ModalFooter>
        </ModalContent>
    </Modal>
    );
}

export default EditModal;
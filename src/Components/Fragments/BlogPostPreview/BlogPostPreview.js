import { AspectRatio, Box, Heading, Image, Link, Text, WrapItem } from "@chakra-ui/react";
import BlogAuthor from "../BlogAuthor";
import BlogTags from "../BlogTags";
import { Link as ReachLink } from 'react-router-dom';

const BlogPostPreview = (props) => {
    return(
        // width={{ base: '100%', sm: '45%', md: '45%', lg: '30%' }}>
        <WrapItem width={'100%'}>
            <Box w="100%">
                <Box borderRadius="lg" overflow="hidden">
                    <Link textDecoration="none" _hover={{ textDecoration: 'none' }}>
                        <AspectRatio>
                            <Image
                                transform="scale(1.0)"
                                src={
                                props.postHeaderImageSource
                                }
                                alt="some text"
                                objectFit='cover'
                                width="100%"
                                transition="0.3s ease-in-out"
                                _hover={{
                                transform: 'scale(1.05)',
                                }}
                            />
                        </AspectRatio>
                    </Link>
                </Box>
                <BlogTags tags={props.tags?.split(',')} marginTop="3" />
                <Heading fontSize="xl" marginTop={5}>
                    <Link as={ReachLink} to={`/post/${props.id}`} textDecoration="none" _hover={{ textDecoration: 'none' }}>
                    {props.title}
                    </Link>
                </Heading>
                <Box mb={5} as={'div'} maxHeight={'90px'} whiteSpace={'pre-line'} overflow={'hidden'} textOverflow={'ellipsis'}>
                    <Text as="p" fontSize="sm" marginTop="2">
                        {props.abstract}
                    </Text>
                </Box>
                <BlogAuthor name={props.owner?.name} postDate={props.postDate} imgSrc={props.owner.avatarSrc} />
            </Box>
        </WrapItem>
    );
};

export default BlogPostPreview;

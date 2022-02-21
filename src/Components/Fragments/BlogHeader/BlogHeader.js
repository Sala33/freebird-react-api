import { Box, Heading, Link, useColorModeValue, Text, Image } from "@chakra-ui/react";
import BlogAuthor from "../BlogAuthor";
import BlogTags from "../BlogTags";

const BlogHeader = (props) => {
    return (
        <Box
        marginTop={{ base: '1', sm: '5' }}
        display="flex"
        flexDirection={{ base: 'column', sm: 'row' }}
        justifyContent="space-between">
        <Box
            display="flex"
            flex="1"
            marginRight="3"
            position="relative"
            alignItems="center">
            <Box
            width={{ base: '100%', sm: '85%' }}
            zIndex="2"
            marginLeft={{ base: '0', sm: '5%' }}
            marginTop="5%">
            <Link textDecoration="none" _hover={{ textDecoration: 'none' }}>
                <Image
                borderRadius="lg"
                src={
                    props.imgPreviewSrc
                }
                alt="some good alt text"
                objectFit="contain"
                />
            </Link>
            </Box>
            <Box zIndex="1" width="100%" position="absolute" height="100%">
            <Box
                bgGradient={useColorModeValue(
                'radial(orange.600 1px, transparent 1px)',
                'radial(orange.300 1px, transparent 1px)'
                )}
                backgroundSize="20px 20px"
                opacity="0.4"
                height="100%"
            />
            </Box>
        </Box>
        <Box
            display="flex"
            flex="1"
            flexDirection="column"
            justifyContent="center"
            marginTop={{ base: '3', sm: '0' }}>
            <BlogTags tags={props.tags} />
            <Heading marginTop="1">
            <Link textDecoration="none" _hover={{ textDecoration: 'none' }}>
                {props.blogTitle}
            </Link>
            </Heading>
            <Text
            as="p"
            marginTop="2"
            color={useColorModeValue('gray.700', 'gray.200')}
            fontSize="lg">
                {props.previewText}
            </Text>
            <BlogAuthor {...props.author} />
        </Box>
        </Box>
    );
};

export default BlogHeader;
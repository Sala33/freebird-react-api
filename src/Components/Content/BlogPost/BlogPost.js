import React from "react";
import { chakra, Box, useColorModeValue, Icon, Image, Stack, Text } from "@chakra-ui/react";
import MainBodyContainer from "../../Fragments/MainBodyContainer";
import BlogAuthor from "../../Fragments/BlogAuthor";
import { useParams } from "react-router-dom";
import { useBlogPost } from "../../../hooks/useBlogPosts";
import MDEditor from "@uiw/react-md-editor";

const BlogPost = () => {
  const bg = useColorModeValue("white", "gray.800");
  const { id } = useParams();

  const post = useBlogPost(id);
  const colorValue = useColorModeValue("gray.900", "white")

  return (
      <>     
    {post?
      <>  
      <Box pos="relative" overflow="hidden" bg={bg} mt={10}>
      <Box maxW="7xl" mx="auto">
        <Box
          pos="relative"
          pb={{ base: 8, sm: 16, md: 20, lg: 28, xl: 32 }}
          maxW={{ lg: "2xl" }}
          w={{ lg: "full" }}
          zIndex={1}
          bg={bg}
          border="solid 1px transparent"
        >
          <Icon
            display={{ base: "none", lg: "block" }}
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            h="full"
            w={48}
            color={bg}
            transform="translateX(50%)"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </Icon>
          <Box
            mx="auto"
            maxW={{ base: "7xl" }}
            px={{ base: 4, sm: 6, lg: 8 }}
            mt={{ base: 10, sm: 12, md: 16, lg: 20, xl: 28 }}
          >
            <Box
              w="full"
              textAlign={{ sm: "center", lg: "left" }}
              justifyContent="center"
              alignItems="center"
            >
              <chakra.h1
                fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }}
                letterSpacing="tight"
                lineHeight="short"
                fontWeight="extrabold"
                color={colorValue}
              >
                <chakra.span display={{ base: "block", xl: "inline" }}>
                  {post.title}
                </chakra.span>
              </chakra.h1>
              <chakra.p
                mt={{ base: 3, sm: 5, md: 5 }}
                fontSize={{ sm: "lg", md: "xl" }}
                maxW={{ sm: "xl" }}
                mx={{ sm: "auto", lg: 0 }}
                color="gray.500"
              >
                {post.abstract}
              </chakra.p>
            </Box>
            <Stack py={2}>
                <BlogAuthor imgSrc={post.owner.avatarSrc} name={post.owner.name} postDate={post.postDate}/>
            </Stack>
          </Box>
        </Box>
      </Box>
      <Box
        position={{ lg: "absolute" }}
        top={{ lg: 0 }}
        bottom={{ lg: 0 }}
        right={{ lg: 0 }}
        w={{ lg: "50%" }}
        border='solid 1px transparent'
      >
        <Image
          h={[56, 72, 96, "full"]}
          w="full"
          fit="cover"
          src={post.postHeaderImageSource? 
            post.postHeaderImageSource 
            :
            "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"}
          alt=""
          loading="lazy"
        />
      </Box>
    </Box>
    <MainBodyContainer>
      <MDEditor.Markdown source={post.postBody} />
    </MainBodyContainer>
    </>
    :
    <Text>Loading...</Text>}
    </>
  );
};

export default BlogPost;
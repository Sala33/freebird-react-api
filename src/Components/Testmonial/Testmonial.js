import React from "react";
import {
  Box,
  Image,
  Flex,
  useColorModeValue,
  Link,
  Text,
  HStack,
} from "@chakra-ui/react";
import ReactStars from "react-rating-stars-component";

const Testmonial = (props) => {
  return (
    <Flex
      bg={useColorModeValue("#F9FAFB", "gray.600")}
      py={50}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="md"
        mx="auto"
        py={4}
        px={8}
        bg={useColorModeValue("white", "gray.800")}
        shadow="lg"
        rounded="lg"
      >
        <Flex justifyContent={{ base: "center", md: "end" }} mt={-16}>
          <Image
            w={20}
            h={20}
            fit="cover"
            rounded="full"
            borderStyle="solid"
            borderWidth={2}
            borderColor={useColorModeValue("brand.500", "brand.400")}
            alt="Testimonial avatar"
            src={props.authorAvatar}
          />
        </Flex>

        <Text mt={2} fontWeight={'light'} fontSize={'sm'} color={useColorModeValue("gray.600", "gray.200")}>
         {props.reviewText}
        </Text>

        <Flex justifyContent="end" mt={4}>
            <HStack>
                <ReactStars
                    count={5}
                    size={24}
                    value={props.grade}
                    edit={false}
                    activeColor="#ffd700"
                    />
                <Link                   
                    fontSize="xl"
                    color={useColorModeValue("brand.500", "brand.300")}
                >
                    {props.author}
                </Link>
            </HStack>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Testmonial;
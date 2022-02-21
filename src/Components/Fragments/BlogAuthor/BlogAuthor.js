import { Avatar, HStack, Text, VStack } from "@chakra-ui/react";

const getDate = (date) => {
  return new Date(Date.parse(date));
}

const getAuthorName = (name) => {
  const arr = name.split(' ');
  if (arr.length === 0) return name;

  return arr.slice(0, 2).join(' ');
}

const BlogAuthor = (props) => {
    return (
      <HStack marginTop="2" spacing={1} display="flex" alignItems="center">
        <Avatar           
          src={props.imgSrc}
          alt={`Avatar of ${props.name}`} />
        <VStack spacing={0}>
          <Text fontWeight="medium" fontSize={'sm'}>{getAuthorName(props.name)}</Text>
          <Text>{getDate(props.postDate).toLocaleDateString()}</Text>
        </VStack>
      </HStack>
    );
};

export default BlogAuthor;
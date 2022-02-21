import { HStack, Tag } from "@chakra-ui/react";

const BlogTags = (props) => {
    return (
      <HStack spacing={2} marginTop={props.marginTop}>
        {props.tags.map((tag, index) => {
          return (
            <Tag size={'md'} variant="solid" colorScheme="brand" key={index}>
              {tag}
            </Tag>
          );
        })}
      </HStack>
    );
  };

  export default BlogTags;
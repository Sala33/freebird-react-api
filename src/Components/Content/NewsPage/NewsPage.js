import {
    Heading,
    Divider,
    Wrap,
    Container,
} from '@chakra-ui/react';

import BlogHeader from '../../Fragments/BlogHeader';
import BlogPostPreview from '../../Fragments/BlogPostPreview';
import LargeBanner from '../../Fragments/LargeBanner/LargeBanner';

const post = {
    imgPreviewSrc: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&auto=format&fit=crop&w=800&q=80',
    blogTitle: 'Blog article title',
    previewText: `Lorem Ipsum is simply dummy text of the printing and typesetting
    industry. Lorem Ipsum has been the industry's standard dummy text
    ever since the 1500s, when an unknown printer took a galley of
    type and scrambled it to make a type specimen book.`,
    author: { name: "John Doe",
              date: new Date('2021-04-06T19:01:27Z'),
        },
    tags: ['Editais', 'Tecnologia']
};


const NewsPage = () => {
  return(
    <>
        <LargeBanner headerTitle={"NEWS"} />
        <Container maxW={'7xl'} p="12">
            <BlogHeader {...post}/>
            <Heading as="h2" marginTop="5">
            Latest articles
            </Heading>
            <Divider marginTop="5" />
            <Wrap spacing="30px" marginTop="5">              
                    <BlogPostPreview {...post}/>
                    <BlogPostPreview {...post}/>
                    <BlogPostPreview {...post}/>
                    <BlogPostPreview {...post}/>
                    <BlogPostPreview {...post}/>
            </Wrap>
        </Container>
    </>
);
};

export default NewsPage;
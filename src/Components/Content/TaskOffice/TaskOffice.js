import { AspectRatio, Text } from "@chakra-ui/react";
import MainBodyContainer from "../../Fragments/MainBodyContainer";
import ReactMarkdown from 'react-markdown'
import markdown from './Markdown/relatos_naufragios.md'
import { useEffect, useState } from "react";
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import LargeBanner from "../../Fragments/LargeBanner/LargeBanner";

const clickupStylings = {background: 'transparent', border: '1px solid #ccc'};

const TaskOffice = (props) => {

    const [mdText, setMdText] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(markdown)
          .then(res => res.text())
          .then(
            (result) => {
              setIsLoaded(true);
              setMdText(result);
            },
            // Note: it's important to handle errors here
            // instead of a catch() block so that we don't swallow
            // exceptions from actual bugs in components.
            (error) => {
              setIsLoaded(true);
              setError(error);
            }
          )
      }, [])

    return(
        <MainBodyContainer rowSpacing={20}>
            <AspectRatio ratio={16 / 9}>
                <iframe title="Calendar" className="clickup-embed" src="https://sharing.clickup.com/c/h/2weac-3923/f84ab232f549495" width="100%" height="700px" style={clickupStylings}></iframe>
            </AspectRatio>
            <AspectRatio ratio={16 / 9}>
                <iframe  title="TaskList" className="clickup-embed" src="https://sharing.clickup.com/l/h/2weac-3963/6778dd75a803346"  width="100%" height="700px" style={clickupStylings}></iframe>            
            </AspectRatio>
            <AspectRatio ratio={16 / 9}>
                <iframe title="TaskListKanban" className="clickup-embed" src="https://sharing.clickup.com/b/h/6-156915233-2/12060167281d2d0" width="100%" height="700px" style={clickupStylings}></iframe>            
            </AspectRatio>
            <LargeBanner headerTitle={"Docs Teste"} />
            { error
                ? <Text>{error.message}</Text>
                : isLoaded
                    ? <ReactMarkdown components={ChakraUIRenderer()} children={`${mdText}`} skipHtml />
                    : <Text>Loading...</Text>
            }
            
        </MainBodyContainer>
    );
}

export default TaskOffice;
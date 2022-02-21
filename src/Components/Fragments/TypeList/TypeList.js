import { SearchIcon } from "@chakra-ui/icons";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Link, List, ListIcon, ListItem, Spinner } from "@chakra-ui/react";

const TypeList = (props) => {
    return(
        <Accordion>
            {!props.itemList ? <Spinner /> :
                props.itemList.map((item, indexNum) => {
                    return(
                        <AccordionItem key={indexNum}>
                            <h2>
                            <AccordionButton>
                                <Box flex='1' textAlign='left'>
                                {item.name}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <List>
                                    {item.Subcategories.map((sub, index) => {
                                        return(                                 
                                            <ListItem key={index}>
                                                <ListIcon as={SearchIcon} color='green.500' />
                                                <Link>{sub}</Link>
                                            </ListItem>
                                        );
                                    })}                        
                                </List>
                            </AccordionPanel>
                        </AccordionItem>
                    );
                    })                   
            }
        </Accordion>
    );
};

export default TypeList;

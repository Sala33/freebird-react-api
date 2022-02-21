import { AspectRatio, Box, Button, Center, Flex, Heading, HStack, Image, SimpleGrid, Spacer, Stack, Stat, StatLabel, StatNumber, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { useAllJobData } from "../../../hooks/useJobData";
import { useProjectsData, useProjectsDataObject } from "../../../hooks/useProjectsData";
import JobsCarousel from "../../JobsCarousel/JobsCarousel";
import MainPageCarousel from "../../MainPageCarousel";
import bg from "./images/Gravura.png"
import boranda from "./images/Boranda.png"
import colibri from "./images/Colibri-Apresenta.png"
import fest from "./images/Festival-Criativo.png"
import SimpleCarousel from "../../SimpleCarousel/SimpleCarousel";
import { Carousel } from "react-responsive-carousel";
import { useNavigate } from "react-router-dom";
import { useProdutorasData } from "../../../hooks/useProdutorasData";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination, Scrollbar } from "swiper";

const indicatorStyles = {
    background: '#FCB022',
};

const MainPage = (params) => {

    return(
        <VStack>
            <Heading>MAIN</Heading>
        </VStack>
    );
};

export default MainPage;

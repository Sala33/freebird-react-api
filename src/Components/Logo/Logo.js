import { Image } from "@chakra-ui/react";
import logo from './images/sala33-oficial.png'

const Logo = (props) => {
    return (
        <Image src={logo} maxHeight={32}/>
    );
  };

  export default Logo;
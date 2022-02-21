import { Spinner, Text } from '@chakra-ui/react';
import { useIsFetching } from 'react-query';

const Loading = () => {
  // will use React Query `useIsFetching` to determine whether or not to display
  const isFetching = useIsFetching(); // for now, just don't display

  const display = isFetching ? 'inherit' : 'none';

  return (
    <Spinner
      thickness='4px'
      speed='0.65s'
      emptyColor='gray.200'
      color='brand.500'
      size='xl'
      role="status"
      position="fixed"
      zIndex="9999"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      display={display}
    >
      <Text display="none">Loading...</Text>
    </Spinner>
  );
}

export default Loading;
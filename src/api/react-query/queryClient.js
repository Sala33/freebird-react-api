import { QueryClient } from "react-query";
import { createStandaloneToast } from '@chakra-ui/react';
import customTheme from '../../themes'

const toast = createStandaloneToast({ customTheme });

function queryErrorHandler(error) {
  // error is type unknown because in js, anything can be an error (e.g. throw(5))
  const id = 'react-query-error';
  const title =
    error instanceof Error ? error.message : 'error connecting to server';

  // prevent duplicate toasts
  toast.closeAll();
  toast({ id, title, status: 'error', variant: 'subtle', isClosable: true });
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            onError: queryErrorHandler,
        }
    }
});
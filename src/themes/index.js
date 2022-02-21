import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react'
import { createBreakpoints } from '@chakra-ui/theme-tools'

// 2. Update the breakpoints as key-value pairs
const breakpoints = createBreakpoints({
  sm: '320px',
  md: '768px',
  lg: '960px',
  xl: '1200px',
  'laptop': '1024px',
})

const customTheme = extendTheme({
    colors :{
        brand: {
            50: '#FCB022',
            100: '#e2d7de',
            200: '#d3c3ce',
            300: '#c5afbe',
            400: '#b79bae',
            500: '#5853A2',
            600: '#9a738e',
            700: '#8b5f7e',
            800: '#7d4b6e',
            900: '#6f385e',
        }
    },
},
  withDefaultColorScheme({
    colorScheme: 'brand',
    components: ['Button', 'Badge'],
  }),
  withDefaultColorScheme({
    colorScheme: 'white',
    components: ['Text', 'Link'],
  }),
  breakpoints,
);

export default customTheme;
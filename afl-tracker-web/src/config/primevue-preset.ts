import Aura from '@primevue/themes/aura';
import { definePreset } from '@primevue/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fcf9ed',
      100: '#f8f1d4',
      200: '#f0e0a4',
      300: '#e8cf74',
      400: '#e0bf44',
      500: '#EBBC3A',
      600: '#d4a21c',
      700: '#aa7e16',
      800: '#8c6517',
      900: '#765318',
      950: '#432c08'
    },
    info: {
      50: '{myteal.50}',
      100: '{myteal.100}',
      200: '{myteal.200}',
      300: '{myteal.300}',
      400: '{myteal.400}',
      500: '{myteal.500}',
      600: '{myteal.600}',
      700: '{myteal.700}',
      800: '{myteal.800}',
      900: '{myteal.900}',
      950: '{myteal.950}'
    }
  },
  primitive: {
    myteal: {
      50: '#effdfc',
      100: '#d6f9f8',
      200: '#b1f3f1',
      300: '#7beae8',
      400: '#3fd9d7',
      500: '#10B3B0',
      600: '#0d9694',
      700: '#0f7776',
      800: '#115f5e',
      900: '#134e4e',
      950: '#062f2f'
    }
  }
});

export default MyPreset;

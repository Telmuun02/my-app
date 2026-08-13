import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // MUI нь загвараа стандартаар @emotion-оор гаргадаг, гэхдээ энэ төсөлд
  // styled-components суусан (@mui/styled-engine-sc). Энэ alias-гүй бол MUI
  // суулгаагүй @emotion/react-ыг хайж build унана.
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
})

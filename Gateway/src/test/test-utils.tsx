import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import '../styles/variables.css'
import '../index.css'

// Test wrapper component that provides styling context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      fontFamily: 'var(--font-family)',
      backgroundColor: 'var(--lighter-gray)',
      color: 'var(--dark)',
      lineHeight: '1.6'
    }}>
      {children}
    </div>
  )
}

// Custom render function that includes the test wrapper
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from './test-utils'
import DataSync from '../pages/DataSync/DataSync'
import { dataSyncService } from '../services/dataSyncService'

// Mock the dataSyncService
vi.mock('../services/dataSyncService', () => ({
  dataSyncService: {
    exportData: vi.fn(),
    downloadFile: vi.fn(),
    cancelExport: vi.fn(),
    isExportCancellable: vi.fn(),
  }
}))

describe('DataSync Component Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with basic elements', () => {
    render(<DataSync />)
    
    // Check if main elements are rendered
    expect(screen.getByText('Data Sync')).toBeInTheDocument()
    expect(screen.getByText('Exportar Dados')).toBeInTheDocument()
    expect(screen.getByText('Importar Dados')).toBeInTheDocument()
    expect(screen.getByText('Exportar')).toBeInTheDocument()
  })

  it('should show error message when export fails', async () => {
    const mockExportData = vi.mocked(dataSyncService.exportData)
    const testError = {
      type: 'SERVER_ERROR',
      code: 'TEST_ERROR',
      message: 'Test error message',
      retryable: true,
      timestamp: new Date().toISOString()
    }
    mockExportData.mockRejectedValue(testError)

    render(<DataSync />)
    
    const exportButton = screen.getByText('Exportar')
    exportButton.click()

    // Wait for error to appear
    await screen.findByText('Test error message')
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })
})
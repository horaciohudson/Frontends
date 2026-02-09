import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from './test-utils'
import fc from 'fast-check'
import DataSync from '../pages/DataSync/DataSync'
import { dataSyncService } from '../services/dataSyncService'
import { ExportErrorType } from '../types'

// Mock the dataSyncService
vi.mock('../services/dataSyncService', () => ({
  dataSyncService: {
    exportData: vi.fn(),
    downloadFile: vi.fn(),
    cancelExport: vi.fn(),
    isExportCancellable: vi.fn(),
  }
}))

/**
 * Property-based tests for DataSync component state management.
 * 
 * **Property 12: Frontend State Management**
 * **Validates: Requirements 5.1, 5.4, 5.5**
 * 
 * For any export operation in the frontend, the DataSync component should display appropriate 
 * loading indicators during processing, show specific error messages from response headers 
 * when failures occur, and automatically trigger file downloads upon successful completion.
 */
describe('DataSync Frontend State Management Property Tests', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Property: Loading State Management
   * Validates: Requirement 5.1 - Loading indicators during processing
   */
  it('should display loading indicators and disable export button during any export operation', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        module: fc.constantFrom('manager', 'financial', 'production', 'cloud'),
        entity: fc.constantFrom('users', 'products', 'customers', 'sales'),
        format: fc.constantFrom('CSV', 'EXCEL', 'JSON'),
        processingTime: fc.integer({ min: 100, max: 500 })
      }),
      async (exportRequest) => {
        // Clear all mocks before each property test iteration
        vi.clearAllMocks()
        
        // Mock a delayed export operation
        const mockExportData = vi.mocked(dataSyncService.exportData)
        mockExportData.mockImplementation(async () => {
          await new Promise(resolve => setTimeout(resolve, exportRequest.processingTime))
          return new Blob(['test data'], { type: 'text/csv' })
        })

        render(<DataSync />)
        
        // Find the first export section (there should only be one in a fresh render)
        const exportSections = screen.getAllByText('Exportar Dados')
        const exportSection = exportSections[0].closest('.sync-section')
        expect(exportSection).toBeInTheDocument()
        
        const exportButton = exportSection!.querySelector('button')!
        expect(exportButton).toBeInTheDocument()
        expect(exportButton).not.toBeDisabled()

        // Trigger export
        await act(async () => {
          fireEvent.click(exportButton)
        })

        // Verify loading state is immediately active
        await waitFor(() => {
          expect(exportButton).toBeDisabled()
        }, { timeout: 1000 })

        // Wait for export to complete
        await waitFor(() => {
          expect(exportButton).not.toBeDisabled()
        }, { timeout: exportRequest.processingTime + 1000 })
      }
    ), { numRuns: 3 })
  })

  /**
   * Property: Error Message Display
   * Validates: Requirement 5.4 - Specific error messages from response headers
   */
  it('should display specific error messages for any type of export failure', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        errorType: fc.constantFrom(
          ExportErrorType.NETWORK_ERROR,
          ExportErrorType.AUTHENTICATION_ERROR,
          ExportErrorType.TIMEOUT_ERROR,
          ExportErrorType.VALIDATION_ERROR,
          ExportErrorType.CONFIGURATION_ERROR,
          ExportErrorType.DATA_ERROR,
          ExportErrorType.SERVER_ERROR
        ),
        errorCode: fc.string({ minLength: 5, maxLength: 20 }).filter(s => s.trim().length >= 5),
        errorMessage: fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length >= 10),
        errorDetails: fc.option(fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5)),
        retryable: fc.boolean(),
        module: fc.constantFrom('manager', 'financial', 'production', 'cloud'),
        entity: fc.constantFrom('users', 'products', 'customers', 'sales')
      }),
      async (errorScenario) => {
        // Clear all mocks before each property test iteration
        vi.clearAllMocks()
        
        // Mock export failure
        const mockExportData = vi.mocked(dataSyncService.exportData)
        const exportError = {
          type: errorScenario.errorType,
          code: errorScenario.errorCode,
          message: errorScenario.errorMessage,
          details: errorScenario.errorDetails,
          retryable: errorScenario.retryable,
          module: errorScenario.module,
          entity: errorScenario.entity,
          timestamp: new Date().toISOString()
        }
        mockExportData.mockRejectedValue(exportError)

        render(<DataSync />)
        
        // Find the first export section
        const exportSections = screen.getAllByText('Exportar Dados')
        const exportSection = exportSections[0].closest('.sync-section')
        expect(exportSection).toBeInTheDocument()
        
        const exportButton = exportSection!.querySelector('button')!
        
        // Trigger export
        await act(async () => {
          fireEvent.click(exportButton)
        })

        // Wait for error to be displayed
        await waitFor(() => {
          expect(screen.getByText(errorScenario.errorMessage)).toBeInTheDocument()
        }, { timeout: 2000 })

        // Verify error code is displayed
        expect(screen.getByText(`Código: ${errorScenario.errorCode}`)).toBeInTheDocument()

        // Verify error details if present
        if (errorScenario.errorDetails) {
          expect(screen.getByText(errorScenario.errorDetails)).toBeInTheDocument()
        }

        // Verify retry button is shown for retryable errors
        if (errorScenario.retryable) {
          expect(screen.getByText(/Tentar Novamente/)).toBeInTheDocument()
        }
      }
    ), { numRuns: 3 })
  })

  /**
   * Property: Successful Export File Download
   * Validates: Requirement 5.5 - Automatic file download upon successful completion
   */
  it('should automatically trigger file download for any successful export operation', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        module: fc.constantFrom('manager', 'financial', 'production', 'cloud'),
        entity: fc.constantFrom('users', 'products', 'customers', 'sales'),
        format: fc.constantFrom('CSV', 'EXCEL', 'JSON'),
        dataSize: fc.integer({ min: 100, max: 1000 }),
        contentType: fc.constantFrom('text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json')
      }),
      async (exportRequest) => {
        // Clear all mocks before each property test iteration
        vi.clearAllMocks()
        
        // Mock successful export
        const mockExportData = vi.mocked(dataSyncService.exportData)
        const mockDownloadFile = vi.mocked(dataSyncService.downloadFile)
        
        const testBlob = new Blob(['x'.repeat(exportRequest.dataSize)], { type: exportRequest.contentType })
        mockExportData.mockResolvedValue(testBlob)

        render(<DataSync />)
        
        // Find the first export section
        const exportSections = screen.getAllByText('Exportar Dados')
        const exportSection = exportSections[0].closest('.sync-section')
        expect(exportSection).toBeInTheDocument()
        
        const formatSelects = exportSection!.querySelectorAll('select')
        const formatSelect = formatSelects[2] as HTMLSelectElement // Third select is format
        fireEvent.change(formatSelect, { target: { value: exportRequest.format } })

        // Get the export button from the export section
        const exportButton = exportSection!.querySelector('button')!
        
        // Trigger export
        await act(async () => {
          fireEvent.click(exportButton)
        })

        // Wait for export to complete and success message to appear
        await waitFor(() => {
          expect(screen.getByText('Exportação Concluída')).toBeInTheDocument()
        }, { timeout: 2000 })

        // Verify downloadFile was called
        expect(mockDownloadFile).toHaveBeenCalledTimes(1)
        const [blob, filename] = mockDownloadFile.mock.calls[0]
        
        expect(blob).toBe(testBlob)
        
        // Verify filename format based on export format
        const expectedExtension = exportRequest.format === 'CSV' ? 'csv' : 
                                 exportRequest.format === 'EXCEL' ? 'xlsx' : 'json'
        expect(filename).toMatch(new RegExp(`.*\\.${expectedExtension}$`))

        // Verify success message is displayed
        expect(screen.getByText('O arquivo foi baixado automaticamente para seu computador.')).toBeInTheDocument()
      }
    ), { numRuns: 3 })
  })
})
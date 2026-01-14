import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 7
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisible) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show pages with ellipsis
            const leftSiblingIndex = Math.max(currentPage - 1, 1);
            const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

            const showLeftEllipsis = leftSiblingIndex > 2;
            const showRightEllipsis = rightSiblingIndex < totalPages - 1;

            // Always show first page
            pages.push(1);

            if (showLeftEllipsis) {
                pages.push('...');
            }

            // Show pages around current
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                }
            }

            if (showRightEllipsis) {
                pages.push('...');
            }

            // Always show last page
            if (totalPages > 1) {
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number | string) => {
        if (typeof page === 'number') {
            onPageChange(page);
        }
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            <button
                className="pagination-button pagination-prev"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                aria-label="Página anterior"
            >
                ‹
            </button>

            {pages.map((page, index) => (
                <button
                    key={index}
                    className={`pagination-button ${page === currentPage ? 'pagination-active' : ''
                        } ${page === '...' ? 'pagination-ellipsis' : ''}`}
                    onClick={() => handlePageClick(page)}
                    disabled={page === '...'}
                    aria-label={typeof page === 'number' ? `Página ${page}` : undefined}
                    aria-current={page === currentPage ? 'page' : undefined}
                >
                    {page}
                </button>
            ))}

            <button
                className="pagination-button pagination-next"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
            >
                ›
            </button>
        </div>
    );
}

export default Pagination;

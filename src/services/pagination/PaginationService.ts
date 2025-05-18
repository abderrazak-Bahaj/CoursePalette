export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  invoices: T[];
  meta: PaginationMeta;
}

export class PaginationService {
  static getPageNumbers(currentPage: number, lastPage: number): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Maximum number of page buttons to show

    if (lastPage <= maxPages) {
      // If we have fewer pages than max, show all pages
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of page range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(lastPage - 1, currentPage + 1);

      // Adjust range if at the start or end
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= lastPage - 1) {
        start = lastPage - 3;
      }

      // Add ellipsis if needed
      if (start > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (end < lastPage - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always include last page
      pages.push(lastPage);
    }

    return pages;
  }

  static getPageSizeOptions(): number[] {
    return [10, 25, 50, 100];
  }
} 
import React from 'react';
import TablePagination from '@material-ui/core/TablePagination';

interface AppsPagination {
  count: number;
  page: number;
  onPageChange: (event: unknown, newPage: number) => void;
  className: string;
}

const AppsPagination: React.FC<AppsPagination> = ({
  count,
  page,
  onPageChange,
  className = '',
}) => {
  return (
    <TablePagination
      component='div'
      count={count}
      rowsPerPage={15}
      className={className}
      page={page}
      backIconButtonProps={{'aria-label': 'Previous Page'}}
      nextIconButtonProps={{'aria-label': 'Next Page'}}
      onChangePage={onPageChange}
      rowsPerPageOptions={[]}
    />
  );
};

export default AppsPagination;

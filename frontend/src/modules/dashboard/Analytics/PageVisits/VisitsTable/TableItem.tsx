import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import {Box, makeStyles} from '@material-ui/core';
import TableRow from '@material-ui/core/TableRow';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import {PageVisit} from '../../../../../types/models/Analytics';
import {CremaTheme} from '../../../../../types/AppContextPropsType';

interface TableItemProps {
  data: PageVisit;
}

const TableItem: React.FC<TableItemProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    tableCell: {
      fontSize: 16,
      padding: 8,
      '&:first-child': {
        [theme.breakpoints.up('xl')]: {
          paddingLeft: 4,
        },
      },
      '&:last-child': {
        [theme.breakpoints.up('xl')]: {
          paddingRight: 4,
        },
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
        padding: 16,
      },
    },
    tableData: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    iconGreenColor: {
      color: theme.palette.success.main,
      width: 30,
      height: 30,
    },
    iconSecondaryColor: {
      color: theme.palette.secondary.main,
      width: 30,
      height: 30,
    },
  }));
  const classes = useStyles();
  return (
    <TableRow key={data.id}>
      <TableCell component='th' scope='data' className={classes.tableCell}>
        {data.page}
      </TableCell>
      <TableCell align='right' className={classes.tableCell}>
        <Box className={classes.tableData}>
          <ArrowDropUpIcon className={classes.iconGreenColor} /> {data.pageView}
        </Box>
      </TableCell>
      <TableCell align='right' className={classes.tableCell}>
        <Box className={classes.tableData}>
          <ArrowDropDownIcon className={classes.iconSecondaryColor} />
          {data.visitors}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default TableItem;

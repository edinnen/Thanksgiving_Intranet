import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Box from '@material-ui/core/Box';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import {TransactionData} from '../../../../../types/models/Analytics';
import {makeStyles} from '@material-ui/core';
import {CremaTheme} from '../../../../../types/AppContextPropsType';

interface Props {
  data: TransactionData;
}

const useStyles = makeStyles((theme: CremaTheme) => ({
  tableCell: {
    fontSize: 16,
    padding: '12px 8px',
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
  anchar: {
    color: theme.palette.primary.main,
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    display: 'inline-block',
  },
  badgeRoot: {
    padding: '3px 10px',
    borderRadius: 4,
    display: 'inline-block',
  },
}));

const TableItem: React.FC<Props> = ({data}) => {
  const classes = useStyles();
  const getPaymentTypeColor = () => {
    switch (data.paymentType) {
      case 'COD': {
        return '#F84E4E';
      }
      case 'Prepaid': {
        return '#43C888';
      }
      default: {
        return '#E2A72E';
      }
    }
  };
  const getPaymentStatusColor = () => {
    switch (data.status) {
      case 'In Transit': {
        return '#F84E4E';
      }
      case 'Delivered': {
        return '#43C888';
      }
      default: {
        return '#E2A72E';
      }
    }
  };

  return (
    <TableRow key={data.id}>
      <TableCell component='th' scope='row' className={classes.tableCell}>
        <Box className={classes.anchar}>{data.id}</Box>
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        {data.customer}
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        {data.date}
      </TableCell>
      <TableCell
        align='left'
        className={classes.tableCell}
        style={{color: getPaymentTypeColor()}}>
        {data.paymentType}
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        <Box
          className={classes.badgeRoot}
          style={{
            color: getPaymentStatusColor(),
            backgroundColor: getPaymentStatusColor() + '44',
          }}>
          {data.status}
        </Box>
      </TableCell>
      <TableCell align='right' className={classes.tableCell}>
        <MoreHorizIcon />
      </TableCell>
    </TableRow>
  );
};

export default TableItem;

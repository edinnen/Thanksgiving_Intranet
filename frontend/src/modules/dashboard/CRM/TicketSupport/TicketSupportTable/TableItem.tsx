import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import {Box, makeStyles} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import TableRow from '@material-ui/core/TableRow';
import {red} from '@material-ui/core/colors';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {TicketSupportDataProps} from '../../../../../types/models/CRM';
import {CremaTheme} from '../../../../../types/AppContextPropsType';

interface TableItemProps {
  row: TicketSupportDataProps;
}

const TableItem: React.FC<TableItemProps> = ({row}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    borderBottomClass: {
      borderBottom: '0 none',
    },
    tableCell: {
      borderBottom: '0 none',
      fontSize: 14,
      padding: '6px 8px',
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
      },
    },
    avatar: {
      width: 40,
      height: 40,
      backgroundColor: red[500],
      [theme.breakpoints.up('xl')]: {
        width: 50,
        height: 50,
      },
    },
  }));
  const classes = useStyles();

  return (
    <TableRow className={classes.borderBottomClass}>
      <TableCell component='th' scope='row' className={classes.tableCell}>
        {row.id}.
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        {row.ticketId}
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        <Box display='flex' alignItems='center'>
          {row.image ? (
            <Avatar className={classes.avatar} src={row.image} />
          ) : (
            <Avatar className={classes.avatar}>
              {row.name[0].toUpperCase()}
            </Avatar>
          )}
          <Box component='span' ml={{xs: 3, xl: 5}} fontFamily={Fonts.MEDIUM}>
            {row.name}
          </Box>
        </Box>
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        {row.created}
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        {row.contact}
      </TableCell>
    </TableRow>
  );
};

export default TableItem;

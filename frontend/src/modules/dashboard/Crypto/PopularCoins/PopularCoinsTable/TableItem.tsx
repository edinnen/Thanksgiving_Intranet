import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import {Box, makeStyles} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import PageviewIcon from '@material-ui/icons/Pageview';
import TableRow from '@material-ui/core/TableRow';
import clsx from 'clsx';
import {green, red} from '@material-ui/core/colors';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {PopularCoinsData} from '../../../../../types/models/Crypto';
import {CremaTheme} from '../../../../../types/AppContextPropsType';

interface TableItemProps {
  row: PopularCoinsData;
}

const TableItem: React.FC<TableItemProps> = ({row}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    borderBottomClass: {
      borderBottom: '0 none',
    },
    tableCell: {
      borderBottom: '0 none',
      fontSize: 14,
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
    tableCellColor: {
      color: green[600],
    },
    fontBold: {
      fontFamily: Fonts.MEDIUM,
    },
    whitespaceNowrap: {
      whiteSpace: 'nowrap',
    },
    avatar: (props: any) => ({
      width: 40,
      height: 40,
      padding: 12,
      backgroundColor: props.image ? props.color : red[500],
      [theme.breakpoints.up('xl')]: {
        width: 50,
        height: 50,
      },
    }),
  }));
  const classes = useStyles(row);
  return (
    <TableRow className={classes.borderBottomClass}>
      <TableCell component='th' scope='row' className={classes.tableCell}>
        {row.id}.
      </TableCell>
      <TableCell
        align='left'
        className={clsx(classes.tableCell, classes.whitespaceNowrap)}>
        <Box display='flex'>
          <Box mr={{xs: 3, xl: 5}}>
            {row.image ? (
              <Avatar className={classes.avatar}>
                <img src={row.image} alt='' />
              </Avatar>
            ) : (
              <Avatar className={classes.avatar}>
                <PageviewIcon />
              </Avatar>
            )}
          </Box>
          <Box component='span' mt={3} mr={1} fontWeight={700}>
            {row.name}
          </Box>
          <Box color='grey.500' ml={1} mt={3}>
            ({row.shortName})
          </Box>
        </Box>
      </TableCell>
      <TableCell
        align='left'
        className={clsx(classes.tableCell, classes.fontBold)}>
        ${row.marketCap}
      </TableCell>
      <TableCell align='left' className={classes.tableCell}>
        ${row.volume}
      </TableCell>
      <TableCell
        align='right'
        className={clsx(
          classes.tableCell,
          classes.fontBold,
          classes.whitespaceNowrap,
          classes.tableCellColor,
        )}>
        {row.h} %
      </TableCell>
    </TableRow>
  );
};

export default TableItem;

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {makeStyles} from '@material-ui/core/styles';
import {grey} from '@material-ui/core/colors';
import {Fonts} from '../../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../../types/AppContextPropsType';

interface Props {
  props?: any;
}

const TableHeading: React.FC<Props> = (props) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    tableRowRoot: {
      color: grey[500],
    },
    tableCellRoot: {
      borderBottom: '0 none',
      fontSize: 16,
      padding: 8,
      fontFamily: Fonts.LIGHT,
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
  }));

  const classes = useStyles(props);
  return (
    <TableRow className={classes.tableRowRoot}>
      <TableCell className={classes.tableCellRoot}>OrderID</TableCell>
      <TableCell align='left' className={classes.tableCellRoot}>
        Customer
      </TableCell>
      <TableCell align='left' className={classes.tableCellRoot}>
        Order Date
      </TableCell>
      <TableCell align='left' className={classes.tableCellRoot}>
        Payment
      </TableCell>
      <TableCell align='left' className={classes.tableCellRoot}>
        Status
      </TableCell>
      <TableCell align='right' className={classes.tableCellRoot}>
        {' '}
      </TableCell>
    </TableRow>
  );
};

export default TableHeading;

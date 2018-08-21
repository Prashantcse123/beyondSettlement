import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import MUIDataTable from '../../shared/MUIDataTable/MUIDataTable';

import Grid from '@material-ui/core/Grid';
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import MoreIcon from "@material-ui/icons/MoreHoriz";

import Styles from './Scorecard.styles';

@withStyles(Styles)
@withRouter
@inject("store")
@observer
export default class Scorecard extends Component {
    constructor(props) {
        super(props);
        this._allSelected = [];
        this.state = {
            sortedColumn: {column: 'Score', order: 'desc'},
            openedRow: false,
            userSelectedRows: []
        };

        Beyond.App.Views.Scorecard = this;
    }

    get store() {
        return this.props.store.scorecard;
    }

    componentDidMount() {
        const { scorecard } = this.props.store;

        scorecard.fetchAllRows().then(() => {
            this._allSelected = scorecard.allRows.map(a => a).filter(a => a.isDone);
            this.forceUpdate();
        });

        document.title = 'Beyond - Scorecard';
    }

    get tableColumns() {
        const { sortedColumn } = this.state;

        return [{
            name: '#',
            options: {
                sortDirection: sortedColumn.column === '#' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Tradeline',
            options: {
                sortDirection: sortedColumn.column === 'Tradeline' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Creditor',
            options: {
                sortDirection: sortedColumn.column === 'Creditor' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Program',
            options: {
                sortDirection: sortedColumn.column === 'Program' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Score',
            options: {
                sortDirection: sortedColumn.column === 'Score' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Details',
            options: {sort: false},
        }];
    }

    get tableRows() {
        const { store } = this.props;
        const { scorecard } = store;

        let sortColumn = this.state.sortedColumn.column;
        let sortOrder = this.state.sortedColumn.order;

        return scorecard.allRows
            .map(a => ({
                '#': a.id,
                Tradeline: a.tradeLineName,
                Creditor: a.creditor,
                Program: a.programName,
                Score: a.totalScore,
                Details: (<Button onClick={(e) => this.onRowClick(e, a)}><MoreIcon/></Button>)
            }))
            .sortBy(sortColumn, sortOrder)
            .map(a => [
                a['#'],
                a.Tradeline,
                a.Creditor,
                a.Program,
                a.Score,
                a.Details
            ]);
    }


    onRowClick(e, scorecard) {
        e.stopPropagation();
        this.setState({openedRow: scorecard});
    }


    onColumnSort(column, order) {
        // column = column.toLowerCase();
        this.setState({sortedColumn: {column, order}});
    }


    // onColumnSort(column, order) {
    //     //this.setState({sortedColumn: {column, order}});
    //     const { scorecard } = this.props.store;
    //     scorecard.setSort({column, order});
    // }

    onFilterChange(value) {
        const { scorecard } = this.props.store;
        scorecard.setFilter(value);
    }

    onRowSizeChange(value) {
        const { scorecard } = this.props.store;
        scorecard.setRowSize(value);
    }

    onPageClick(page) {
        const { scorecard } = this.props.store;
        // this.setState({selectedScorecardRows: []});
        scorecard.setPage(page);
    }

    onRowSelection(currentSelectedRow) {
        const { userSelectedRows } = this.state;
        const { scorecard } = this.props.store;

        if (currentSelectedRow === undefined) {
            if (userSelectedRows.empty()) {
                this.setState({userSelectedRows: userSelectedRows.concat(scorecard.allRows.map(a => a))});
            }else{
                this.setState({userSelectedRows: []});
            }
        }else{
            userSelectedRows.toggle(scorecard.allRows[currentSelectedRow.first().dataIndex]);
            this.setState({userSelectedRows});
        }
    }

    onSelectionApproved(userSelected) {
        const { scorecard } = this.props.store;

        // let allSelected = scorecard.allRows.map(a => a).filter(a => a.isDone);
        let selected = userSelected.filter(a =>
            !this._allSelected.map(b => b.id).includes(a.id))[0];
        let unselected;

        if (!selected) {
            unselected = this._allSelected.filter(a => !userSelected.includes(a))[0];
        }

        console.log({id: (selected || unselected).id, isDone: (!!selected)});
        scorecard.updateRow({id: (selected || unselected).id, isDone: (!!selected)}).then(() => {
            if (selected) {
                this._allSelected.push(selected);
            }else{
                this._allSelected.remove(unselected);
            }
            this.setState({userSelectedRows: []});
        });
    }

    renderConfirmDialog() {
        const { userSelectedRows } = this.state;

        return (
            <Dialog
                open={!userSelectedRows.empty()}
                onClose={() => this.setState({userSelectedRows: []})}
            >
                <DialogTitle>Mark Row Completed</DialogTitle>
                <DialogContent style={{width: 500}}>
                    <br/>
                    Are you sure?
                    <br/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({userSelectedRows: []})}>
                        No
                    </Button>
                    <Button
                        color="primary"
                        autoFocus
                        onClick={() => this.onSelectionApproved(userSelectedRows)}
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderOpenedDialog() {
        const { classes } = this.props;
        const { openedRow } = this.state;

        return (
            <Dialog
                open={!!openedRow}
                onClose={() => this.setState({openedRow: undefined})}
            >
                <DialogTitle>Details</DialogTitle>
                <DialogContent>
                    <br/>
                    <Grid container>
                        {Object.keys((openedRow || {})).filter(key => !key.includes('At') && !key.includes('rank')).map(key =>
                            <Grid item xs={6}>
                                <FormControl className={classes.formControl}>
                                    <InputLabel shrink>
                                        {
                                            key .camelCaseToDelimiter()
                                                .replace('_', ' - ')
                                                .replace('Accumulation', 'Acc.')
                                                .replace('_end Of Current Month', ' (Current M.)')
                                                .replace('Pct_', ' (')
                                                .replace('_', ' ')
                                                .replace('month Out', 'M. Out)')
                                                .capitalize()
                                        }
                                    </InputLabel>
                                    <br/>
                                    <TextField
                                        value={((key.toLowerCase().includes('pct') && !key.toLowerCase().includes('points') && !key.toLowerCase().includes('weight') ? Numeral((openedRow[key] || 0)).format('0.00%') : openedRow[key]) || '')}
                                    />
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.setState({openedRow: undefined})}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    // renderRows() {
    //     const { scorecard } = this.props.store;
    //
    //     return scorecard.allRows.map(a => Object.assign({}, a, {details: (<Button onClick={(e) => this.onRowClick(e, a)}>...</Button>)}));
    // }

	render() {
        const { classes, store } = this.props;
        const { scorecard } = store;
        // const { column, order } = this.state.sortedColumn;

        return (
			<div className={classes.scorecard}>
                <MUIDataTable
                    title="Eligible Accounts"
                    options={{
                        filter: false,
                        download: false,
                        print: false,
                        selectableRows: true,
                        // filterType: 'checkbox',
                        responsive: 'scroll',
                        rowsSelected: this._allSelected.map(a => scorecard.allRows.indexOf(a)),
                        rowsPerPage: scorecard.rowSize,
                        count: scorecard.count,
                        page: scorecard.page,
                        onChangePage: (page) => this.onPageClick(page),
                        onChangeRowsPerPage: (rows) => this.onRowSizeChange(rows),
                        onRowsSelect: (currentRowsSelected, rowsSelected) => this.onRowSelection(currentRowsSelected),
                        onSearchChange: (value) => this.onFilterChange(value),
                        onColumnSortChange: (column, order) => this.onColumnSort(column, order),
                        // onRowsDelete: (rowsDeleted) => this.onDeleteRowsClick()
                    }}
                    data={this.tableRows}
                    columns={this.tableColumns}
                />
                {this.renderOpenedDialog()}
                {this.renderConfirmDialog()}
            </div>
		);
	}
}

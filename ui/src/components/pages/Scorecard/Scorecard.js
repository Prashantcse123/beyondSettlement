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
            activeBottomButton: 'scorecard',
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
        const { sort } = this.store;

        return [{
            name: '    Details',
            options: {sort: false, style: {width: 20, textAlign: 'center'}},
            component: (row) => <Button onClick={(e) => this.onRowClick(e, row)}><MoreIcon/></Button>
        }, {
            key: 'totalScore',
            name: 'Score',
            options: {
                sortDirection: sort.column === 'totalScore' ? sort.order : undefined
            },
        }, {
            key: 'programName',
            name: 'Program',
            options: {
                sortDirection: sort.column === 'programName' ? sort.order : undefined
            },
        }, {
            key: 'tradeLineName',
            name: 'Tradeline',
            options: {
                sortDirection: sort.column === 'tradeLineName' ? sort.order : undefined
            },
        }, {
            key: 'creditor',
            name: 'Creditor',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }, {
            key: 'metrics_accountDelinquency',
            name: 'Account Delinquency',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }, {
            key: 'balance',
            name: 'Balance',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }, {
            key: 'metrics_feeEstimate',
            name: 'Fee Estimate',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }, {
            key: 'endOfCurrentMonthFundAccumulation',
            name: 'This Month Fund Acc.',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }, {
            key: 'metrics_accountStatus',
            name: 'Account Status',
            options: {
                sortDirection: sort.column === 'creditor' ? sort.order : undefined
            },
        }];
    }

    get tableRows() {
        const { store } = this.props;
        const { scorecard } = store;

        return scorecard.allRows
            .map(a => this.tableColumns.map(c => {
                if (c.component) {
                    return c.component(a)
                }else{
                    return a[c.key];
                }
            }));
    }

    onRowClick(e, scorecard) {
        e.stopPropagation();
        this.setState({openedRow: scorecard});
    }


    onColumnSort(column, order) {
        column = this.tableColumns.first(c => c.name === column).key;

        const { scorecard } = this.props.store;
        scorecard.setSort({column, order});
    }

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

    onBottomButtonClick(button) {
        this.setState({activeBottomButton: button});
        this.store.fetchAllRows({[button]: true});
    }

    renderBottomTabs() {
        const { classes } = this.props;

        return (
            <div className={classes.bottomTabs} hidden={this.store.allRows.empty()}>
                <Button
                    color="primary"
                    size="small"
                    variant={this.state.activeBottomButton === 'scorecard' ? 'contained' : 'outlined'}
                    className={classes.bottomTabsButton} onClick={() => this.onBottomButtonClick('scorecard')}
                >
                    Scorecard
                </Button>
                <Button
                    color="primary"
                    size="small"
                    variant={this.state.activeBottomButton === 'clientRanking' ? 'contained' : 'outlined'}
                    className={classes.bottomTabsButton} onClick={() => this.onBottomButtonClick('clientRanking')}
                >
                    Client Rankings
                </Button>
                <Button
                    color="primary"
                    size="small"
                    variant={this.state.activeBottomButton === 'eligibleAccounts' ? 'contained' : 'outlined'}
                    className={classes.bottomTabsButton} onClick={() => this.onBottomButtonClick('eligibleAccounts')}
                >
                    Eligible Accounts
                </Button>
            </div>
        );
    }

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
                {this.renderBottomTabs()}
            </div>
		);
	}
}

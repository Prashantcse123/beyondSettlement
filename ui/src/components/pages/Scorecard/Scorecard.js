import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";

import DataTable from '../../shared/DataTables/DataTables';

import {GridList, GridTile} from 'material-ui/GridList';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import './Scorecard.scss'

@withRouter
@inject("store")
@observer
export default class Scorecard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortedColumn: {column: 'id', order: 'desc'},
            openedRow: false,
            userSelectedRows: undefined
        };
    }

    get store() {
        return this.props.store.scorecard;
    }

    componentDidMount() {
        const { scorecard } = this.props.store;
        // let scorecardRowId = this.props.match.params.id;

        // scorecard.setFilter(undefined);
        scorecard.fetchAllRows().then(() => {
            this._allSelected = scorecard.allRows.map(a => a).filter(a => a.isDone);
            this.forceUpdate();
        });

        document.title = 'Beyond - Scorecard';
    }

    // static get columnWidths() {
    //     return [
    //         '30px',
    //         '120px',
    //         '150px',
    //         'auto',
    //         '100px',
    //         '100px',
    //         '100px',
    //         '50px'
    //     ];
    // }
    //
    // renderRowDate(scorecardRow) {
    //     return <span>{Moment.utc(scorecardRow.created_at).local().format('DD/MM/YYYY HH:mm')}</span>;
    // }


    onRowClick(e, scorecard) {
        e.stopPropagation();
        this.setState({openedRow: scorecard});
    }

    onColumnSort(column, order) {
        //this.setState({sortedColumn: {column, order}});
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

    onRowSelection(userSelected) {
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
            this.setState({userSelectedRows: undefined});
        });
    }

    renderConfirmDialog() {
        const { userSelectedRows } = this.state;

        return (
            <Dialog
                title="Mark Row Completed"
                actions={[
                    <FlatButton
                        label="No"
                        onClick={() => this.setState({userSelectedRows: undefined})}
                    />,
                    <FlatButton
                        label="Yes"
                        onClick={() => this.onRowSelection(userSelectedRows)}
                    />,
                ]}
                modal={false}
                open={!!userSelectedRows}
                onRequestClose={() => this.setState({userSelectedRows: undefined})}
                autoScrollBodyContent
            >
                Are you sure?
            </Dialog>
        );
    }

    renderOpenedDialog() {
        const { openedRow } = this.state;

        return (
            <Dialog
                className="opened-row-dialog"
                title="Details"
                actions={[
                    <FlatButton
                        label="Close"
                        onClick={() => this.setState({openedRow: undefined})}
                    />,
                ]}
                modal={false}
                open={!!openedRow}
                onRequestClose={() => this.setState({openedRow: undefined})}
                autoScrollBodyContent
            >
                <GridList cols={2} cellHeight={85}>
                    {Object.keys((openedRow || {})).filter(key => !key.includes('At') && !key.includes('rank')).map(key =>
                        <GridTile key={key}>
                            <TextField
                                floatingLabelText={
                                    key .camelCaseToDelimiter()
                                        .replace('_', ' - ')
                                        .replace('Accumulation', 'Acc.')
                                        .replace('_end Of Current Month', ' (Current M.)')
                                        .replace('Pct_', ' (')
                                        .replace('_', ' ')
                                        .replace('month Out', 'M. Out)')
                                        .capitalize()}
                                floatingLabelFixed
                                value={((key.toLowerCase().includes('pct') && !key.toLowerCase().includes('points') && !key.toLowerCase().includes('weight') ? Numeral((openedRow[key] || 0)).format('0.00%') : openedRow[key]) || '')}
                            />
                        </GridTile>
                    )}
                </GridList>
            </Dialog>
        );
    }

    renderRows() {
        const { scorecard } = this.props.store;

        return scorecard.allRows.map(a => Object.assign({}, a, {details: (<FlatButton label="..." onClick={(e) => this.onRowClick(e, a)} />)}));
    }

	render() {
        const { scorecard } = this.props.store;
        const { column, order } = this.state.sortedColumn;

        return (
			<div className="scorecard-page">
                <DataTable
                    height="100%"
                    selectable
                    multiSelectable
                    enableSelectAll={false}
                    showCheckboxes
                    showRowHover
                    showHeaderToolbar
                    showHeaderToolbarFilterIcon={false}
                    headerToolbarMode="filter"
                    footerToolbarStyle={{position: 'fixed', bottom: 0, width: '100%'}}
                    tableBodyStyle={{marginBottom: '50px'}}
                    initialSort={{column: 'index', order: 'asc'}}
                    selectedRows={this._allSelected}
                    onRowSelection={(indexes, userSelectedRows) => {
                        this.setState({userSelectedRows});
                    }}
                    onFilterValueChange={(value) => this.onFilterChange(value)}
                    onSortOrderChange={(column, order) => this.onColumnSort(column, order)}
                    onRowSizeChange={(i, value) => this.onRowSizeChange(value)}
                    onPageClick={(page) => this.onPageClick(page)}
                    onCellClick={(rowIdx, colIdx, scorecard) => this.onRowClick(scorecard)}
                    page={scorecard.page}
                    count={scorecard.count}
                    rowSize={scorecard.rowSize}
                    data={this.renderRows()}
                    columns={[{
                        key: 'id',
                        label: '#',
                        sortable: true,
                        // style: {width: Scorecard.columnWidths[0]}
                    }, {
                        key: 'tradeLineName',
                        label: 'Trade Line',
                        sortable: true,
                        // style: {width: Scorecard.columnWidths[1]}
                    }, {
                        key: 'creditor',
                        label: 'Creditor',
                        sortable: true,
                        // style: {width: Scorecard.columnWidths[2]}
                    }, {
                        key: 'programName',
                        label: 'Program',
                        sortable: true,
                        // style: {width: Scorecard.columnWidths[2]}
                    }, {
                        key: 'totalScore',
                        label: 'Score',
                        sortable: true,
                        // style: {width: Scorecard.columnWidths[2]}
                    }, {
                        key: 'details',
                        label: 'Details',
                        sortable: false,
                        alignRight: false,
                        style: {width: '100px', textAlign: 'center'}
                    }]}
                />
                {this.renderOpenedDialog()}
                {this.renderConfirmDialog()}
            </div>
		);
	}
}

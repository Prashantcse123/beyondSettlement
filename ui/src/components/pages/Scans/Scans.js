import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

// import ScanDetails from '../../published/scopio-elements/src/ScanDetails/ScanDetails';
// import ShareScanDialog from '../../published/scopio-elements/src/Dialogs/ShareScanDialog/ShareScanDialog';
// import DeleteScanDialog from "../../published/scopio-elements/src/Dialogs/DeleteScanDialog/DeleteScanDialog";
import ScanDetails from '@scopio/scopio-components/lib/ScanDetails';
import ShareScanDialog from '@scopio/scopio-components/lib/ShareScanDialog';
import DeleteScanDialog from '@scopio/scopio-components/lib/DeleteScanDialog';

import MUIDataTable from '../../shared/MUIDataTable/MUIDataTable';

import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Card from "@material-ui/core/Card";

import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import ContentAddIcon from '@material-ui/icons/Add';
import ContentDeleteIcon from '@material-ui/icons/DeleteForever';
import PictureInPictureIcon from '@material-ui/icons/PictureInPicture';
import EventIcon from '@material-ui/icons/EventNote';
import EditIcon from '@material-ui/icons/ModeEdit';
import ShareIcon from '@material-ui/icons/Share';
import ExportIcon from '@material-ui/icons/Input';

import Styles from './Scans.styles';

@withStyles(Styles)
@withRouter
@inject("store")
@observer
export default class Scans extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortedColumn: {column: 'index', order: 'desc'},
            selectedScans: [],
            deleteScans: [],
            loadingScan: undefined,
            sharedScans: []
        };
    }

    get store() {
        return this.props.store.scans;
    }

    componentDidMount() {
        let scanId = this.props.match.params.id;

        this.store.setFilter(undefined);
        this.store.fetchAllScans();

        if (scanId) {
            this.store.fetchScan(scanId).then(() =>
                this.setState({editedScan: this.store.fetchedScan}));
        }

        document.title = 'Scopio - Scans';
    }

    static get columnWidths() {
        return [
            '50px',
            '120px',
            '150px',
            'auto',
            '100px',
            '100px',
            '100px',
            '50px'
        ];
    }

    get tableColumns() {
        const { sortedColumn } = this.state;

        return [{
            name: '#',
            options: {
                style: {width: Scans.columnWidths[0]},
                sortDirection: sortedColumn.column === '#' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Created',
            options: {
                style: {width: Scans.columnWidths[1]},
                sortDirection: sortedColumn.column === 'created' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Thumbnail',
            options: {
                sort: false,
                style: {width: Scans.columnWidths[2]},
            },
        }, {
            name: 'Name',
            options: {
                style: {width: Scans.columnWidths[3]},
                sortDirection: sortedColumn.column === 'name' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Slide ID',
            options: {
                style: {width: Scans.columnWidths[4]},
                sortDirection: sortedColumn.column === 'slide id' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Analyses',
            options: {
                style: {width: Scans.columnWidths[5]},
                sortDirection: sortedColumn.column === 'analyses' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Species',
            options: {
                style: {width: Scans.columnWidths[6]},
                sortDirection: sortedColumn.column === 'species' ? sortedColumn.order : undefined
            },
        }, {
            name: 'Tools',
            options: {
                sort: false,
                style: {width: Scans.columnWidths[7], textAlign: 'center'}
            },
        }];
    }

    renderScanRowEditIcon(scan) {
        const { classes } = this.props;

        return (
            <Tooltip title="Edit" placement="left">
                <Button
                    className={classes.toolButton}
                    onClick={(e) => this.onEditScanClick(e, scan)}
                >
                    <EditIcon/>
                </Button>
            </Tooltip>
        );
    }

    renderScanRowViewIcon(scan) {
        const { classes } = this.props;

        return (
            <a href={'/#/view_scan/' + scan.public_id}>
                <Tooltip title="View" placement="left">
                    <Button className={classes.toolButton}>
                        <PictureInPictureIcon/>
                    </Button>
                </Tooltip>
            </a>
        );
    }

    renderScanRowReportIcon(scan) {
        const { classes } = this.props;

        return (
            <a href={'/#/scan_report/' + scan.public_id} target="_blank">
                <Tooltip title="Report" placement="left">
                    <Button className={classes.toolButton}>
                        <EventIcon/>
                    </Button>
                </Tooltip>
            </a>
        );
    }

    renderScanRowExportIcon(scan) {
        const { classes } = this.props;

        return (
            <a href={Scopio.AppSettings.exportAppBaseUrl.replace('<public_scan_id>', scan.public_id)} target="_blank">
                <Tooltip title="Export" placement="left">
                    <Button
                        className={classes.toolButton}
                        hidden={!Scopio.SystemSettings.export_scans}
                    >
                        <ExportIcon/>
                    </Button>
                </Tooltip>
            </a>
        );
    }

    renderScanRowShareIcon(scan) {
        const { classes } = this.props;

        if (Scopio.AppSettings.isExternalClient === 'true') return;

        return (
            <Tooltip title={(!scan.share_link ? 'Unshared' : 'Shared')} placement="left">
                <Button
                    className={classes.toolButton}
                    color={!!scan.share_link ? "primary" : null}
                    onClick={(e) => this.onShareClick(e, scan)}
                >
                    <ShareIcon/>
                </Button>
            </Tooltip>
        );
    }

    renderScanRowTools(scan) {
        return (
            <div>
                {this.renderScanRowEditIcon(scan)}
                <br/>
                {this.renderScanRowViewIcon(scan)}
                <br/>
                {this.renderScanRowShareIcon(scan)}
                <br hidden={Scopio.AppSettings.isExternalClient === 'true'} />
                {this.renderScanRowReportIcon(scan)}
                <br/>
                {this.renderScanRowExportIcon(scan)}
            </div>
        );
    }

    renderScanRowImage(scan) {
        const { classes } = this.props;

        return (
            <a href={'/#/view_scan/' + scan.public_id}>
                <img className={classes.scanThumbnail} src={scan.thumbnail_url} />
            </a>
        );
    }

    renderScanRowDate(scan) {
        return <span>{Moment.utc(scan.created_at).local().format('DD/MM/YYYY HH:mm')}</span>;
    }

    get allScans() {
        let sortColumn = this.state.sortedColumn.column;
        let sortOrder = this.state.sortedColumn.order;

        return this.store.allScans
            .map(scan =>
                Object.assign({}, scan, {
                    index: scan.id,
                    created: this.renderScanRowDate(scan),
                    img: this.renderScanRowImage(scan),
                    tools: this.renderScanRowTools(scan),
                    analyses: scan.analyses.join('  |  '),
                    species: (scan.species || '').capitalize()
                }))
            .map(scan => [
                scan.index,
                scan.created,
                scan.img,
                (scan.name || ''),
                (scan.slide_id || ''),
                scan.analyses,
                (scan.species || ''),
                scan.tools,
            ])
            .sortBy(sortColumn, sortOrder)
            .reverse();
    }

    get editedScan() {
        return this.state.editedScan || {};
    }

    onRowSelection(currentSelectedScan) {
        const { selectedScans } = this.state;
        const { scans } = this.props.store;

        if (currentSelectedScan === undefined) {
            if (selectedScans.empty()) {
                this.setState({selectedScans: selectedScans.concat(scans.allScans.map(a => a))});
            }else{
                this.setState({selectedScans: []});
            }
        }else{
            selectedScans.toggle(scans.allScans[currentSelectedScan.first().dataIndex]);
            this.setState({selectedScans});
        }
    }

    onColumnSort(column, order) {
        column = column.toLowerCase();
        this.setState({sortedColumn: {column, order}});
    }

    onFilterChange(value) {
        this.store.setFilter(value);
    }

    onRowSizeChange(value) {
        this.store.setRowSize(value);
    }

    onPageClick(page) {
        this.setState({selectedScans: []});
        this.store.setPage(page);
    }

    onEditScanClick(e, scan) {
        e.stopPropagation();
        this.openEditDialog(scan);
    }

    onDeleteScansClick() {
        const { selectedScans } = this.state;

        this.openDeleteDialog(selectedScans);
        return false;
    }

    onNewScanClick() {
        this.props.history.push('/new_scan');
    }

    onShareClick(e, scan) {
        e.stopPropagation();
        this.setState({shareDialogScanId: scan.public_id});
    }

    openEditDialog(scan) {
        this.setState({editedScan: scan});
    }

    openDeleteDialog(deleteScans) {
        this.setState({deleteScans});
    }

    closeEditDialog() {
        this.setState({editedScan: undefined});
    }

    closeDeleteDialog() {
        this.setState({deleteScans: []});
    }

    onCommitDeleteDialog() {
        const { deleteScans } = this.state;

        this.store.deleteScans(deleteScans).then((deleteResponseMessage) => {
            this.store.fetchAllScans().then(() => {
                Scopio.TopMessage.show(deleteResponseMessage);
                this.closeDeleteDialog();
                this.setState({selectedScans: []});
            });
        });
    }

    commitEditDialog() {
        if (!this.validateForm()) return;

        this.store.saveScan(this.editedScan).then(() =>
            this.closeEditDialog());
    }

    validateForm() {
        if (!this.editedScan.title) {
            this.setState({nameFieldErrorText: 'This field is required'});
            return;
        }
        return true;
    }

    renderEditDialog() {
        return (
            <Dialog
                open={!!this.state.editedScan}
                onClose={() => this.closeEditDialog()}
                maxWidth={false}
            >
                <DialogTitle>
                    {(this.editedScan.public_id ? 'Edit Scan (' + this.editedScan.public_id + ')' : 'New Scan')}
                    <Checkbox
                        checked={!!this.editedScan.share_link}
                        icon={<VisibilityOffIcon/>}
                        checkedIcon={<VisibilityIcon/>}
                        color="primary"
                    />
                </DialogTitle>
                <DialogContent>
                    <ScanDetails scan={this.editedScan} onChange={() => this.forceUpdate()} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.closeEditDialog()}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        autoFocus
                        onClick={() => this.commitEditDialog()}
                        disabled={
                            (!this.editedScan.title) ||
                            (!this.editedScan.species || this.editedScan.species === 'other') ||
                            (!!this.editedScan.info.age && isNaN(this.editedScan.info.age))
                        }
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    renderDialogs() {
        const { deleteScans, shareDialogScanId } = this.state;

        return (
            <div>
                <ShareScanDialog
                    scanId={shareDialogScanId}
                    open={!!shareDialogScanId}
                    onClose={() => this.setState({shareDialogScanId: undefined})}
                />
                <DeleteScanDialog
                    scans={deleteScans}
                    onClose={() => this.closeDeleteDialog()}
                    onCommit={() => this.onCommitDeleteDialog()}
                />
                {this.renderEditDialog()}
            </div>
        );
    }

    renderActionButtons() {
        const { classes } = this.props;
        const { selectedScans } = this.state;

        if (Scopio.AppSettings.isExternalClient === 'true') return;

        return (
            <div>
                <Tooltip title="New Scan">
                    <Button
                        variant="fab"
                        color="primary"
                        className={classes.scansFloatingButton}
                        onClick={() => this.onNewScanClick()}
                        // hidden={selectedScans.length}
                    >
                        <ContentAddIcon/>
                    </Button>
                </Tooltip>
                <Tooltip title="Delete Scan">
                    <Button
                        variant="fab"
                        color="secondary"
                        className={classes.scansFloatingButton}
                        onClick={() => this.onDeleteScansClick()}
                        hidden={!selectedScans.length || true}
                    >
                        <ContentDeleteIcon/>
                    </Button>
                </Tooltip>
            </div>
        );
    }

	render() {
        const { selectedScans } = this.state;
        const { classes, store } = this.props;
        const { scans } = store;
        const { allScans, rowSize } = scans;

        let isExternal = Scopio.AppSettings.isExternalClient === 'true';

        return (
			<Card className={classes.scans}>
                <MUIDataTable
                    title="Scans List"
                    data={this.allScans}
                    columns={this.tableColumns}
                    options={{
                        filter: false,
                        download: false,
                        print: false,
                        selectableRows: !isExternal,
                        // filterType: 'checkbox',
                        responsive: 'scroll',
                        rowsSelected: selectedScans.map(a => allScans.indexOf(a)),
                        rowsPerPage: rowSize,
                        count: this.store.count,
                        page: this.store.page,
                        onChangePage: (page) => this.onPageClick(page),
                        onChangeRowsPerPage: (rows) => this.onRowSizeChange(rows),
                        onRowsSelect: (currentRowsSelected, rowsSelected) => this.onRowSelection(currentRowsSelected),
                        onSearchChange: (value) => this.onFilterChange(value),
                        onColumnSortChange: (column, order) => this.onColumnSort(column, order),
                        onRowsDelete: (rowsDeleted) => this.onDeleteScansClick()
                    }}
                />
                {this.renderActionButtons()}
                {this.renderDialogs()}
            </Card>
		);
	}
}

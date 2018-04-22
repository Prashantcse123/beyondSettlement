import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {TableHeader, TableRow} from 'material-ui/Table';
import {Toolbar} from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
// customized components
import DataTablesTable from './DataTablesTable';
import DataTablesTableBody from './DataTablesTableBody';
import DataTablesHeaderColumn from './DataTablesHeaderColumn';
import DataTablesRow from './DataTablesRow';
import DataTablesRowColumn from './DataTablesRowColumn';
import DataTablesHeaderToolbar from './DataTablesHeaderToolbar';
import Paginate from "./Paginate";

function getStyles(props, context) {
  const {
    baseTheme: {
      palette,
    },
    table,
    tableHeaderColumn,
  } = context.muiTheme;

  return {
    tableHeaderColumn: {
      fontWeight: 600,
    },
    footerToolbar: {
      backgroundColor: table.backgroundColor,
      borderTop: `1px solid ${palette.borderColor}`,
    },
    footerControlGroup: {
      fontSize: 12,
      color: tableHeaderColumn.textColor,
      marginLeft: 'auto',
      display: 'flex',
    },
    footerToolbarItem: {
      marginLeft: 8,
      marginRight: 8,
      alignItems: 'center',
      display: 'flex',
    },
    paginationButtons: {
      marginLeft: 24,
    },
    paginationButton: {
      minWidth: 36,
      opacity: 0.54,
    },
    rowSizeMenu: {
      color: tableHeaderColumn.textColor,
    },
    rowSizeControlsWrapper: {
      display: 'flex',
    },
  };
}

function isRowSelected(index, selectedRows, tableData) {
  if (Array.isArray(selectedRows)) {
    if (selectedRows.length > 0) {
        if (isNaN(selectedRows[0])) {
            return selectedRows.map(a =>
                a.index).includes(tableData[index].index);

        }else{
            return selectedRows.includes(index);
        }
    }else{
        return undefined;
    }
  }else{
    return undefined;
  }
}

class DataTables extends Component {
  static muiName = 'DataTables';

  static propTypes = {
    columns: PropTypes.array.isRequired,
    count: PropTypes.number,
    data: PropTypes.array,
    deselectOnClickaway: PropTypes.bool,
    enableSelectAll: PropTypes.bool,
    filterHintText: PropTypes.string,
    filterValue: PropTypes.string,
    fixedFooter: PropTypes.bool,
    fixedHeader: PropTypes.bool,
    footerToolbarStyle: PropTypes.object,
    headerToolbarMode: PropTypes.string,
    height: PropTypes.string,
    initialSort: PropTypes.object,
    multiSelectable: PropTypes.bool,
    onCellClick: PropTypes.func,
    onCellDoubleClick: PropTypes.func,
    onFilterValueChange: PropTypes.func,
    onNextPageClick: PropTypes.func,
    onPreviousPageClick: PropTypes.func,
    onRowSelection: PropTypes.func,
    onRowSizeChange: PropTypes.func,
    onSortOrderChange: PropTypes.func,
    page: PropTypes.number,
    rowSize: PropTypes.number,
    rowSizeLabel: PropTypes.string,
    rowSizeList: PropTypes.array,
    selectable: PropTypes.bool,
    selectedRows: PropTypes.array,
    showCheckboxes: PropTypes.bool,
    showFooterToolbar: PropTypes.bool,
    showHeaderToolbar: PropTypes.bool,
    showHeaderToolbarFilterIcon: PropTypes.bool,
    showRowHover: PropTypes.bool,
    showRowSizeControls: PropTypes.bool,
    stripedRows: PropTypes.bool,
    summaryLabelTemplate: PropTypes.func,
    tableBodyStyle: PropTypes.object,
    tableHeaderColumnStyle: PropTypes.object,
    tableHeaderStyle: PropTypes.object,
    tableRowColumnStyle: PropTypes.object,
    tableRowStyle: PropTypes.object,
    tableStyle: PropTypes.object,
    tableWrapperStyle: PropTypes.object,
    title: PropTypes.string,
    titleStyle: PropTypes.object,
    toolbarIconRight: PropTypes.node,
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  static defaultProps = {
    rowSize: 10,
    rowSizeLabel: 'Rows per page:',
    rowSizeList: [10, 30, 50, 100],
    summaryLabelTemplate: (start, end, count) => {
      return `${start} - ${end} of ${count}`;
    },
    showRowSizeControls: true,
    filterHintText: 'Search',
    columns: [],
    data: [],
    page: 1,
    count: 0,
    fixedHeader: false,
    fixedFooter: false,
    stripedRows: false,
    showRowHover: false,
    selectable: false,
    selectedRows: undefined,
    multiSelectable: false,
    enableSelectAll: false,
    deselectOnClickaway: false,
    showCheckboxes: false,
    height: 'inherit',
    showHeaderToolbar: false,
    showFooterToolbar: true,
    initialSort: {
      column: '',
      order: 'asc',
    },
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      sort: props.initialSort,
    };
  }

  handleHeaderColumnClick = (event, rowIndex, columnIndex) => {
    const adjustedColumnIndex = columnIndex - 1;
    const column = this.props.columns[adjustedColumnIndex];
    if (column && column.sortable) {
      const {sort} = this.state;
      const {onSortOrderChange} = this.props;
      const key = column.key;
      const order = sort.column === column.key && sort.order === 'asc' ? 'desc' : 'asc';
      this.setState({
        sort: {
          column: key,
          order: order,
        },
      });
      if (onSortOrderChange) {
        onSortOrderChange(key, order);
      }
    }
  }

  handleCellClick = (rowIndex, columnIndex, event) => {
    const {onCellClick, selectable} = this.props;
    if (onCellClick && !selectable) {
      const adjustedColumnIndex = this.props.showCheckboxes ? columnIndex : columnIndex;
      onCellClick(
        rowIndex,
        adjustedColumnIndex,
        // row data
        this.props.data[rowIndex],
        // clicked column
        this.props.data[rowIndex][this.props.columns[adjustedColumnIndex].key],
        event
      );
    }
  }

  handleCellDoubleClick = (rowIndex, columnIndex, event) => {
    const {onCellDoubleClick} = this.props;
    if (onCellDoubleClick) {
      const adjustedColumnIndex = this.props.showCheckboxes ? columnIndex : columnIndex - 1;
      onCellDoubleClick(
        rowIndex,
        adjustedColumnIndex,
        // row data
        this.props.data[rowIndex],
        // clicked column
        this.props.data[rowIndex][this.props.columns[adjustedColumnIndex].key],
        event
      );
    }
  }

  handleRowSizeChange = (event, index, value) => {
    const {onRowSizeChange} = this.props;
    if (onRowSizeChange) {
      onRowSizeChange(index, value);
    }
  }

  handlePageClick = (event) => {
    const {onPageClick} = this.props;
    if (onPageClick) {
        onPageClick(event);
    }
  }

  handlePreviousPageClick = (event) => {
    const {onPreviousPageClick} = this.props;
    if (onPreviousPageClick) {
      onPreviousPageClick(event);
    }
  }

  handleNextPageClick = (event) => {
    const {onNextPageClick} = this.props;
    if (onNextPageClick) {
      onNextPageClick(event);
    }
  }

  handleFilterValueChange = (value) => {
    const {onFilterValueChange} = this.props;
    if (onFilterValueChange) {
      onFilterValueChange(value);
    }
  }

  handleRowSelection = (selectedRows) => {
    const {onRowSelection, data} = this.props;

    let selectedObjects;

      if (Array.isArray(selectedRows)) {
          selectedObjects = selectedRows.map(a => data[a]);
      }else if (selectedRows === 'all') {
          selectedObjects = data;
      }else if (selectedRows === 'none') {
          selectedObjects = [];
      }



    if (onRowSelection) {
      onRowSelection(selectedRows, selectedObjects);
    }
  }

  renderTableRowColumnData = (row, column) => {
    if (column.render) return column.render(row[column.key], row);
    return row[column.key];
  }

  render() {
    const {
      title,
      titleStyle,
      filterHintText,
      fixedHeader,
      fixedFooter,
      footerToolbarStyle,
      stripedRows,
      showRowHover,
      selectable,
      multiSelectable,
      enableSelectAll,
      deselectOnClickaway,
      showCheckboxes,
      height,
      showHeaderToolbar,
      showFooterToolbar,
      rowSize,
      rowSizeLabel,
      rowSizeList,
      showRowSizeControls,
      summaryLabelTemplate,
      columns,
      data,
      page,
      toolbarIconRight,
      count,
      tableStyle,
      tableBodyStyle,
      tableHeaderColumnStyle,
      tableHeaderStyle,
      tableRowColumnStyle,
      tableRowStyle,
      tableWrapperStyle,
      headerToolbarMode,
      filterValue,
      showHeaderToolbarFilterIcon,
      ...other, // eslint-disable-line no-unused-vars, comma-dangle
    } = this.props;

    const styles = getStyles(this.props, this.context);

    let start = (page - 1) * rowSize + 1;
    let end = (page - 1) * rowSize + rowSize;
    const totalCount = count === 0 ? data.length : count;
    let previousButtonDisabled = page === 1;
    let nextButtonDisabled = false;
    if (totalCount === 0) {
      start = 0;
      previousButtonDisabled = true;
    } else if (start > totalCount) {
      start = 1;
      previousButtonDisabled = true;
    }
    if (end >= totalCount) {
      end = totalCount;
      nextButtonDisabled = true;
    }

    let headerToolbar;
    if (showHeaderToolbar) {
      headerToolbar = (
        <DataTablesHeaderToolbar
          filterHintText={filterHintText}
          title={title}
          titleStyle={titleStyle}
          onFilterValueChange={this.handleFilterValueChange}
          toolbarIconRight={toolbarIconRight}
          mode={headerToolbarMode}
          filterValue={filterValue}
          showFilterIcon={showHeaderToolbarFilterIcon}
        />
      );
    }

    let rowSizeControls = null;
    if (showRowSizeControls) {
      rowSizeControls = (
        <div style={styles.rowSizeControlsWrapper}>
          <div style={styles.footerToolbarItem}>
            <div>{rowSizeLabel}</div>
          </div>
          {
            rowSizeList.length > 0 ?
            (
              <DropDownMenu
                labelStyle={styles.rowSizeMenu}
                value={rowSize}
                onChange={this.handleRowSizeChange}
              >
                {rowSizeList.map((rowSize) => {
                  return (
                    <MenuItem
                      key={rowSize}
                      value={rowSize}
                      primaryText={rowSize}
                    />
                  );
                })}
              </DropDownMenu>
            ) :
            null
          }
        </div>
      );
    }

    let pageCount = Math.ceil(totalCount / rowSize);
    let pageNumbers;
    if (pageCount <= 5) {
        pageNumbers = (
            <div>
                {Array(pageCount).fill().map((a, page) =>
                    <FlatButton
                        key={page}
                        style={styles.paginationButton}
                        onClick={() => this.handlePageClick(page + 1)}
                        label={page + 1}
                        primary={this.props.page === (page + 1)}
                    />
                )}
            </div>
        );
    }else{
        pageNumbers = (
            <div>
                <FlatButton
                    style={styles.paginationButton}
                    onClick={() => this.handlePageClick(page + 1)}
                    label={page + 1}
                    primary={this.props.page === (page + 1)}
                />
                <FlatButton
                    style={styles.paginationButton}
                    onClick={() => this.handlePageClick(page + 1)}
                    label={page + 1}
                    primary={this.props.page === (page + 1)}
                />
                <FlatButton
                    style={styles.paginationButton}
                    onClick={() => this.handlePageClick(page + 1)}
                    label={page + 1}
                    primary={this.props.page === (page + 1)}
                />
                <FlatButton
                    style={styles.paginationButton}
                    onClick={() => this.handlePageClick(page + 1)}
                    label={page + 1}
                    primary={this.props.page === (page + 1)}
                />
                <FlatButton
                    style={styles.paginationButton}
                    onClick={() => this.handlePageClick(page + 1)}
                    label={page + 1}
                    primary={this.props.page === (page + 1)}
                />
            </div>
        );
    }

    let footerToolbar;
    if (showFooterToolbar) {
      footerToolbar = (
        <Toolbar style={Object.assign({}, styles.footerToolbar, footerToolbarStyle)}>
          <div style={styles.footerControlGroup}>
            {rowSizeControls}
            <div style={styles.footerToolbarItem}>
              <div>{summaryLabelTemplate(start, end, totalCount)}</div>
            </div>
            <div style={Object.assign(styles.paginationButtons, styles.footerToolbarItem)}>
                {rowSize && rowSize > 0 ? <Paginate rows={count} currentPage={page} perPage={rowSize} onPageClick={this.handlePageClick} /> : null}
            </div>
          </div>
        </Toolbar>
      );
    }

    return (
      <div>
        {headerToolbar}
        <DataTablesTable
          height={height}
          fixedHeader={fixedHeader}
          fixedFooter={fixedFooter}
          selectable={selectable}
          multiSelectable={multiSelectable}
          onCellClick={this.handleCellClick}
          onCellDoubleClick={this.handleCellDoubleClick}
          onRowSelection={this.handleRowSelection}
          style={tableStyle}
          bodyStyle={tableBodyStyle}
          wrapperStyle={tableWrapperStyle}
        >
          <TableHeader
            displaySelectAll={showCheckboxes}
            adjustForCheckbox={showCheckboxes}
            enableSelectAll={enableSelectAll}
            style={Object.assign({}, styles.tableHeader, tableHeaderStyle)}
          >
            <TableRow
              onCellClick={this.handleHeaderColumnClick}
              style={Object.assign({}, styles.tableRow, tableRowStyle)}
            >
              {columns.map((column, index) => {
                const style = Object.assign({}, styles.tableHeaderColumn, tableHeaderColumnStyle, column.style || {});
                const sortable = column.sortable;
                const sorted = this.state.sort.column === column.key;
                const order = sorted ? this.state.sort.order : 'asc';
                return (
                  <DataTablesHeaderColumn
                    key={index}
                    style={style}
                    tooltip={column.tooltip}
                    sortable={sortable}
                    sorted={sorted}
                    order={order}
                    alignRight={column.alignRight}
                    className={column.className}
                  >
                    <span>{column.label}</span>
                  </DataTablesHeaderColumn>
                );
              }, this)}
            </TableRow>
          </TableHeader>
          <DataTablesTableBody
            displayRowCheckbox={showCheckboxes}
            deselectOnClickaway={deselectOnClickaway}
            showRowHover={showRowHover}
            stripedRows={stripedRows}
          >
            {data.map((row, index) => {
              return (
                <DataTablesRow
                  style={Object.assign({}, styles.tableRow, tableRowStyle)}
                  key={index}
                  selected={isRowSelected(index, this.props.selectedRows, this.props.data)}
                >
                  {columns.map((column, index) => {
                    return (
                      <DataTablesRowColumn
                        style={Object.assign({}, styles.tableRowColumn, tableRowColumnStyle, column.style)}
                        key={index}
                        alignRight={column.alignRight}
                      >
                        {this.renderTableRowColumnData(row, column)}
                      </DataTablesRowColumn>
                    );
                  })}
                </DataTablesRow>
              );
            })}
          </DataTablesTableBody>
        </DataTablesTable>
        {footerToolbar}
      </div>
    );
  }
}

export default DataTables;

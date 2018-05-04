import BaseStore from './baseStore'
import { observable, action, computed } from "mobx"

export default class ScorecardStore extends BaseStore {
    @observable loading;

    @observable allRows = [];
    @observable sort;
    @observable filter;
    @observable rowSize;
    @observable page;
    @observable pageCount;
    @observable count;
    @observable fetchedScorecardRow;


    async fetchAllRows() {
        let params = {};

        if (this.filter) {
            params.filter = this.filter;
        }

        if (this.rowSize) {
            params.page_size = this.rowSize;
        }

        if (this.page) {
            params.page = this.page;
        }

        if (this.sort) {
            params.sortBy = this.sort.column;
            params.sortOrder = this.sort.order;
        }

        Beyond.App.TopMessage.show('Please wait...');

        let {data} = await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/calculations/scorecard',
            data: {params}
        });

        Beyond.App.TopMessage.hide();

        this.setRowsData(data);
    }

    @action
    setRowsData(data) {
        this.allRows = data.items;
        this.rowSize = data.page_size;
        this.count = data.total_count;
        this.page = data.page;
        this.pageCount = data.page_count;
    }

    @action
    setSort(value) {
        this.sort = value;
        this.fetchAllRows();
    }

    @action
    setFilter(value) {
        this.filter = value;
        this.fetchAllRows();
    }

    @action
    setRowSize(value) {
        this.rowSize = value;
        this.page = undefined;
        this.fetchAllRows();
    }

    @action
    setPage(value) {
        this.page = value;
        this.fetchAllRows();
    }

    @action
    setNextPage() {
        if (this.page === this.pageCount) return;
        this.setPage(this.page + 1);
    }

    @action
    setPrevPage() {
        if (this.page === 1) return;
        this.setPage(this.page - 1);
    }
}

import BaseStore from './baseStore'
import { observable, action, computed } from "mobx"

export default class ScorecardStore extends BaseStore {
    @observable loading;

    @observable allRows = [];
    @observable sort = {column: 'totalScore', order: 'desc'};
    @observable filter;
    @observable rowSize = 100;
    @observable page;
    @observable pageCount;
    @observable count;
    @observable fetchedScorecardRow;


    async fetchAllRows(options = {}) {
        let endPoint = options.eligibleAccounts === true ? 'scorecard_eligible' : 'scorecard';
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

        if (options.clientRanking === true) {
            this.set({sort: {
                    column: 'concatenatedIndex',
                    order: 'asc'
                }});
        }else if (options.scorecard === true) {
            this.set({sort: {
                    column: 'totalScore',
                    order: 'desc'
                }});
        }

        params.sortBy = this.sort.column;
        params.sortOrder = this.sort.order;

        Beyond.App.TopMessage.show('Please wait...');

        let {data} = await this.service.sendRequest({
            method: 'GET',
            url: 'beyond/calculations/' + endPoint,
            data: {params}
        });

        Beyond.App.TopMessage.hide();

        this.setRowsData(data);
    }

    async updateRow(data) {
        // Beyond.App.TopMessage.show('Please wait...');

        await this.service.sendRequest({
            method: 'PUT',
            url: 'beyond/calculations/update_scorecard',
            data
        });

        let row = this.allRows.filter(a => a.id === data.id)[0];

        row.isDone = true;
        this.set({allRows: this.allRows});

        // Beyond.App.TopMessage.hide();
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

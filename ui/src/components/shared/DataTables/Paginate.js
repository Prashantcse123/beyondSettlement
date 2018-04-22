import React from 'react'
import PropTypes from 'prop-types'
import segmentize from 'segmentize'
import times from 'lodash/times'
import last from 'lodash/last'
import first from 'lodash/first'

import FlatButton from 'material-ui/FlatButton';
import NextPageIcon from 'material-ui/svg-icons/navigation/chevron-right';
import PrevPageIcon from 'material-ui/svg-icons/navigation/chevron-left';
import LastPageIcon from 'material-ui/svg-icons/navigation/last-page';
import FirstPageIcon from 'material-ui/svg-icons/navigation/first-page';
import EllipsisIcon from 'material-ui/svg-icons/navigation/more-horiz';


class Paginate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    get styles() {
        return {
            paginationButton: {
                minWidth: 36,
                opacity: 0.54
            }
        };
    }

    handlePageClick(action, currentPage, numPages, nextPage) {
        const { onPageClick } = this.props;
        var _nextPage;
        switch (action) {
            case 'first':
                _nextPage = 1;
                break;
            case 'previous':
                _nextPage = currentPage - 1 < 1 ? 1 : currentPage - 1;
                break;
            case 'next':
                _nextPage = currentPage + 1 > numPages ? numPages : currentPage + 1;
                break;
            case 'last':
                _nextPage = numPages;
                break;
        }
        onPageClick(nextPage || _nextPage)
    }

    pageToLink(currentPage, page) {
        return (
            <FlatButton
                style={this.styles.paginationButton}
                key={page}
                label={page}
                onClick={() => this.handlePageClick(null, null, null, page)}
                primary={page === currentPage}
            />
        );
    }

    centerPage(currentPage, page) {
        return (
            <FlatButton
                style={this.styles.paginationButton}
                key={page}
                label={page}
                primary={page === currentPage}
            />
        );
    }

    ellipsis(position) {
        return (
            <FlatButton
                key={position}
                icon={<EllipsisIcon/>}
                style={this.styles.paginationButton}
                disabled
            />
        );
    }

    renderInnerPages(currentPage, numPages) {
        if (numPages < 9) {
            return this.renderInnerPagesFew(currentPage, numPages);
        } else {
            var pagination = [];
            const segments = segmentize({
                page: currentPage,
                pages: numPages,
                beginPages: 2,
                endPages: 2,
                sidePages: 1
            });
            segments.beginPages.forEach(page => pagination.push(this.pageToLink(currentPage, page)));
            if (first(segments.previousPages) - 1 > last(segments.beginPages)) pagination.push(this.ellipsis('begin'));
            segments.previousPages.forEach(page => pagination.push(this.pageToLink(currentPage, page)));
            segments.centerPage.forEach(page => pagination.push(this.centerPage(currentPage, page)));
            segments.nextPages.forEach(page => pagination.push(this.pageToLink(currentPage, page)));
            if (last(segments.nextPages) + 1 < first(segments.endPages)) pagination.push(this.ellipsis('end'));
            segments.endPages.forEach(page => pagination.push(this.pageToLink(currentPage, page)));

            return pagination;
        }
    }

    renderInnerPagesFew(currentPage, numPages) {
        return times(numPages, (i) => {
            const page = i + 1;

            return (
                <FlatButton
                    style={this.styles.paginationButton}
                    key={page}
                    label={page}
                    onClick={() => this.handlePageClick(null, currentPage, numPages, page)}
                    primary={page === currentPage}
                />
            );
        });
    }

    renderPaginate() {
        const { rows, currentPage, perPage } = this.props;
        const numRows = rows;
        const numPages = Math.ceil( numRows / perPage );

        return (
            <div className='data-tables-paginate'>
                <FlatButton
                    key="first"
                    icon={<FirstPageIcon />}
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('first', currentPage, numPages)}
                />
                <FlatButton
                    key="previous"
                    icon={<PrevPageIcon />}
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('previous', currentPage, numPages)}
                />
                {this.renderInnerPages(currentPage, numPages)}
                <FlatButton
                    key="next"
                    icon={<NextPageIcon />}
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('next', currentPage, numPages)}
                />
                <FlatButton
                    key="last"
                    icon={<LastPageIcon />}
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('last', currentPage, numPages)}
                />
            </div>
        );
    }

    render() {
        return (
            <div className='data-tables-paginate-container'>
                {this.renderPaginate()}
            </div>
        );
    }
}

/* Defines the type of data expected in each passed prop */
Paginate.propTypes = {
    rows: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    perPage: PropTypes.number.isRequired,
    onPageClick: PropTypes.func.isRequired
};

/* Defines the default values for not passing a certain prop */
Paginate.defaultProps = {};

export default Paginate
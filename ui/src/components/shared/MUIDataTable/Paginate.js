import React from 'react';
import PropTypes from 'prop-types';
import segmentize from 'segmentize';
import times from 'lodash/times';
import last from 'lodash/last';
import first from 'lodash/first';

import Button from '@material-ui/core/Button';

import NextPageIcon from '@material-ui/icons/ChevronRight';
import PrevPageIcon from '@material-ui/icons/ChevronLeft';
import LastPageIcon from '@material-ui/icons/LastPage';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import EllipsisIcon from '@material-ui/icons/MoreHoriz';


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
            <Button
                style={this.styles.paginationButton}
                key={page}
                onClick={() => this.handlePageClick(null, null, null, page)}
                color={page === currentPage ? 'primary' : 'default'}
            >
                {page}
            </Button>
        );
    }

    centerPage(currentPage, page) {
        return (
            <Button
                style={this.styles.paginationButton}
                key={page}
                color={page === currentPage ? 'primary' : 'default'}
            >
                {page}
            </Button>
        );
    }

    ellipsis(position) {
        return (
            <Button
                key={position}
                style={this.styles.paginationButton}
                disabled
            >
                <EllipsisIcon/>
            </Button>
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
                <Button
                    style={this.styles.paginationButton}
                    key={page}
                    onClick={() => this.handlePageClick(null, currentPage, numPages, page)}
                    color={page === currentPage ? 'primary' : 'default'}
                >
                    {page}
                </Button>
            );
        });
    }

    render() {
        const { rows, currentPage, perPage } = this.props;
        const numPages = Math.ceil( rows / perPage );

        return (
            <div className='data-tables-paginate' style={{display: 'flex', marginLeft: '30px'}}>
                <Button
                    key="first"
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('first', currentPage, numPages)}
                    disabled={currentPage === 1}
                >
                    <FirstPageIcon/>
                </Button>
                <Button
                    key="previous"
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('previous', currentPage, numPages)}
                    disabled={currentPage === 1}
                >
                    <PrevPageIcon/>
                </Button>
                {this.renderInnerPages(currentPage, numPages)}
                <Button
                    key="next"
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('next', currentPage, numPages)}
                    disabled={currentPage === numPages}
                >
                    <NextPageIcon/>
                </Button>
                <Button
                    key="last"
                    style={this.styles.paginationButton}
                    onClick={() => this.handlePageClick('last', currentPage, numPages)}
                    disabled={currentPage === numPages}
                >
                    <LastPageIcon/>
                </Button>
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
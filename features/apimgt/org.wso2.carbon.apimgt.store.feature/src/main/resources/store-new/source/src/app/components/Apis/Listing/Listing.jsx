/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import qs from 'qs';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import PropTypes from 'prop-types';
import ResourceNotFound from '../../Base/Errors/ResourceNotFound';
import API from '../../../data/api';
import CommonListing from './CommonListing';


/**
 *
 *
 * @param {*} order
 * @param {*} orderBy
 * @returns
 */
function getSorting(order, orderBy) {
    return order === 'desc'
        ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
        : (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1);
}
/**
 *
 *
 * @class EnhancedAPITableHead
 * @extends {React.Component}
 */
class EnhancedAPITableHead extends React.Component {
    static propTypes = {
        onRequestSort: PropTypes.func.isRequired,
        order: PropTypes.string.isRequired,
        orderBy: PropTypes.string.isRequired,
    };

    /**
     *
     *
     * @memberof EnhancedAPITableHead
     */
    createSortHandler = property => (event) => {
        this.props.onRequestSort(event, property);
    };

    /**
     *
     *
     * @returns
     * @memberof EnhancedAPITableHead
     */
    render() {
        const columnData = [
            {
                id: 'name',
                numeric: false,
                disablePadding: true,
                label: 'Name',
            },
            {
                id: 'version',
                numeric: false,
                disablePadding: false,
                label: 'Version',
            },
            {
                id: 'context',
                numeric: false,
                disablePadding: false,
                label: 'Context',
            },
            {
                id: 'rating',
                numeric: false,
                disablePadding: false,
                label: 'Rating',
            },
        ];
        const { order, orderBy } = this.props;

        return (
            <TableHead>
                <TableRow>
                    {columnData.map((column) => {
                        return (
                            <TableCell
                                key={column.id}
                                numeric={column.numeric}
                                sortDirection={orderBy === column.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === column.id}
                                    direction={order}
                                    onClick={this.createSortHandler(column.id)}
                                >
                                    {column.label}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}
/**
 *
 *
 * @class Listing
 * @extends {React.Component}
 */
class Listing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            apis: null,
            value: 1,
            order: 'asc',
            orderBy: 'name',
            path: props.match.path,
        };
    }

    /**
     *
     *
     * @memberof Listing
     */
    setListType = (value) => {
        this.setState({ listType: value });
    };

    /**
     *
     *
     * @memberof Listing
     */
    componentDidMount() {
        const api = new API();
        const promised_apis = api.getAllAPIs();
        promised_apis
            .then((response) => {
                this.setState({ apis: response.obj });
            })
            .catch((error) => {
                const status = error.status;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    this.setState({ isAuthorize: false });
                    const params = qs.stringify({ reference: this.props.location.pathname });
                    this.props.history.push({ pathname: '/login', search: params });
                }
            });
    }

    /**
     *
     *
     * @memberof Listing
     */
    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({ order, orderBy });
    };

    /**
     *
     *
     * @returns
     * @memberof Listing
     */
    render() {
        const { notFound } = this.state;

        if (notFound) {
            return <ResourceNotFound />;
        }

        const { apis, path } = this.state;

        return <CommonListing apis={apis} path={path} />;
    }
}

export default (Listing);

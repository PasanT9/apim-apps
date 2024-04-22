/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import MuiAlert from 'AppComponents/Shared/MuiAlert';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';
import Joi from '@hapi/joi';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControl from '@mui/material/FormControl';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import API from 'AppData/api.js';

const PREFIX = 'AdvertiseInfo';

const classes = {
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`,
    iconSpace: `${PREFIX}-iconSpace`,
    actionSpace: `${PREFIX}-actionSpace`,
    subHeading: `${PREFIX}-subHeading`,
    mandatoryStar: `${PREFIX}-mandatoryStar`,
    alertGrid: `${PREFIX}-alertGrid`,
    alertTitle: `${PREFIX}-alertTitle`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.iconSpace}`]: {
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.actionSpace}`]: {
        margin: '-7px auto',
    },

    [`& .${classes.subHeading}`]: {
        margin: 0,
        display: 'inline-flex',
        lineHeight: 1.5,
        paddingBottom: '20px',
    },

    [`& .${classes.mandatoryStar}`]: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(0.1),
    },

    [`& .${classes.alertGrid}`]: {
        width: '100%',
    },

    [`& .${classes.alertTitle}`]: {
        fontWeight: theme.typography.fontWeightMedium,
        marginTop: -2,
    }
}));

/**
 *
 *
 * @export
 * @param {*} props
 * @returns
 */
const AdvertiseInfo = (props) => {
    const {
        configDispatcher,
        oldApi: { policies: oldPolicies, endpointConfig: oldEndpointConfig, apiType },
        api: {
            advertiseInfo,
            type,
            policies,
            lifeCycleStatus,
            endpointConfig,
        },
        setIsOpen,
        setIsDisabled,
    } = props;
    const {
        allRevisions,
    } = useRevisionContext();

    const [apiFromContext] = useAPI();
    const isDeployed = useMemo(() => {
        if (allRevisions) {
            for (let i = 0; i < allRevisions.length; i++) {
                if (allRevisions[i].deploymentInfo.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }, [allRevisions]);

    const validateUrl = (value, isEmptyAllowed=true) => {
        let urlSchema = Joi.string().uri().empty();
        if (isEmptyAllowed) {
            urlSchema = Joi.string().uri().allow('', null);
        }
        return !urlSchema.validate(value).error;
    };

    const [isValidApiExternalProductionEndpoint, setValidApiExternalProductionEndpoint] = useState(
        validateUrl(advertiseInfo.apiExternalProductionEndpoint, false),
    );
    const [isValidApiExternalSandboxEndpoint, setValidApiExternalSandboxEndpoint] = useState(
        validateUrl(advertiseInfo.apiExternalSandboxEndpoint),
    );
    const [isValidOriginalDevPortalUrl, setValidOriginalDevPortalUrl] = useState(
        validateUrl(advertiseInfo.originalDevPortalUrl)
    );

    const handleOnChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'apiExternalProductionEndpoint':
                setValidApiExternalProductionEndpoint(validateUrl(value, false));
                setIsDisabled(!(validateUrl(value, false) && 
                    validateUrl(advertiseInfo.apiExternalSandboxEndpoint) && 
                    validateUrl(advertiseInfo.originalDevPortalUrl)));
                break;
            case 'apiExternalSandboxEndpoint':
                setValidApiExternalSandboxEndpoint(validateUrl(value));
                setIsDisabled(!(validateUrl(advertiseInfo.apiExternalProductionEndpoint, false) && 
                    validateUrl(value) && 
                    validateUrl(advertiseInfo.originalDevPortalUrl)));
                break;
            default:
                setValidOriginalDevPortalUrl(validateUrl(value));
                setIsDisabled(!(validateUrl(advertiseInfo.apiExternalProductionEndpoint, false) && 
                    validateUrl(advertiseInfo.apiExternalSandboxEndpoint) && 
                    validateUrl(value)));
                break;
        }
        configDispatcher({ action: name, value });
    };

    const handleOnChangeAdvertised = ({ target: { value } }) => {
        configDispatcher({ action: 'advertised', value: value === 'true' });
        if (value === 'false' && lifeCycleStatus === 'PUBLISHED' && (policies.length === 0 || !endpointConfig)) {
            setIsOpen(true);
        } else if (value === 'true' && lifeCycleStatus === 'PUBLISHED') {
            configDispatcher({ action: 'policies', value: oldPolicies });
            configDispatcher({ action: 'endpointConfig', value: oldEndpointConfig });
        }
        if (value === 'true' && apiType !== API.CONSTS.APIProduct) {
            setIsDisabled(!(validateUrl(advertiseInfo.apiExternalProductionEndpoint, false) && 
                validateUrl(advertiseInfo.apiExternalSandboxEndpoint) && 
                validateUrl(advertiseInfo.originalDevPortalUrl)));
        } else {
            setIsDisabled(false);
        }
    };

    return (
        <StyledGrid container spacing={1} alignItems='flex-start'>
            <Grid item>
                <Box>
                    <FormControl component='fieldset' style={{ display: 'flex' }}>
                        <FormLabel component='legend'>
                            {apiType === API.CONSTS.APIProduct ? (
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.label.apiproduct'
                                    defaultMessage='Mark the API Product as third party'
                                />
                            ):(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.label.api'
                                    defaultMessage='Mark the API as third party'
                                />
                            )}
                        </FormLabel>
                        <RadioGroup
                            aria-label='Mark the API as third party'
                            name='advertised'
                            value={advertiseInfo.advertised}
                            onChange={handleOnChangeAdvertised}
                            style={{ display: 'flow-root' }}
                        >
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext)
                                    || type === 'ASYNC' || (apiType !== API.CONSTS.APIProduct && isDeployed)}
                                value
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.yes'
                                        defaultMessage='Yes'
                                    />
                                )}
                            />
                            <FormControlLabel
                                disabled={isRestricted(['apim:api_create'], apiFromContext)
                                    || type === 'ASYNC' || (apiType !== API.CONSTS.APIProduct && isDeployed)}
                                value={false}
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.AdvertiseInfo.advertised.no'
                                        defaultMessage='No'
                                    />
                                )}
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>
            </Grid>
            <Grid item xs={1}>
                <Box>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.tooltip'
                                defaultMessage={
                                    'Indicates if an API is a third party API. You can use third party APIs to expose'
                                    + ' an externally published API through API Manager.'
                                }
                            />
                        )}
                        aria-label='add'
                        placement='right-end'
                        interactive
                    >
                        <HelpOutline />
                    </Tooltip>
                </Box>
            </Grid>
            <Grid className={classes.alertGrid}>
                {type === 'ASYNC' && (
                    <MuiAlert severity='info'>
                        <Typography gutterBottom component='div' className={classes.alertTitle}>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.async.api.warning.title'
                                defaultMessage='The "Other" type streaming APIs will serve as third party APIs.'
                            />
                        </Typography>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.AdvertiseInfo.async.api.warning'
                            defaultMessage={'If you want to deploy and API in the gateway, please create a WebSocket,'
                            + ' SSE or WebSub type of a streaming API.'}
                        />
                    </MuiAlert>
                )}
                {isDeployed && apiType !== API.CONSTS.APIProduct && (
                    <MuiAlert severity='info' className={classes.alert}>
                        <Typography gutterBottom component='div' className={classes.alertTitle}>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.AdvertiseInfo.deployed.api.warning.title'
                                defaultMessage='There are active deployments in the API.'
                            />
                        </Typography>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.AdvertiseInfo.deployed.api.warning'
                            defaultMessage={'Please undeploy the revision before changing the API to a third party'
                            + ' API.'}
                        />
                    </MuiAlert>
                )}
            </Grid>
            <Grid>
                {advertiseInfo.advertised && apiType !== API.CONSTS.APIProduct && (
                    <>
                        <TextField
                            label={(
                                <>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                        + '.apiExternalProductionEndpoint'}
                                        defaultMessage='API External Production Endpoint'
                                    />
                                    <sup className={classes.mandatoryStar}>*</sup>
                                </>
                            )}
                            variant='outlined'
                            name='apiExternalProductionEndpoint'
                            value={advertiseInfo.apiExternalProductionEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={handleOnChange}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidApiExternalProductionEndpoint}
                            helperText={isValidApiExternalProductionEndpoint ? (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalProductionEndpoint.help'}
                                    defaultMessage='This is the external production endpoint of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalEndpoint.error'}
                                    defaultMessage='Invalid Endpoint URL'
                                />
                            )}
                        />
                        <TextField
                            label={(
                                <>
                                    <FormattedMessage
                                        id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                        + '.apiExternalSandboxEndpoint'}
                                        defaultMessage='API External Sandbox Endpoint'
                                    />
                                </>
                            )}
                            variant='outlined'
                            name='apiExternalSandboxEndpoint'
                            value={advertiseInfo.apiExternalSandboxEndpoint}
                            fullWidth
                            margin='normal'
                            onChange={handleOnChange}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidApiExternalSandboxEndpoint}
                            helperText={isValidApiExternalSandboxEndpoint ? (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo.apiExternalSandboxEndpoint'
                                    + '.help'}
                                    defaultMessage='This is the external sandbox endpoint of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.apiExternalEndpoint.error'}
                                    defaultMessage='Invalid Endpoint URL'
                                />
                            )}
                            style={{ marginTop: 0 }}
                        />
                        <TextField
                            label={(
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.originalDevPortalUrl'
                                    defaultMessage='Original Developer URL'
                                />
                            )}
                            variant='outlined'
                            name='originalDevPortalUrl'
                            value={advertiseInfo.originalDevPortalUrl}
                            fullWidth
                            margin='normal'
                            onChange={handleOnChange}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)}
                            error={!isValidOriginalDevPortalUrl}
                            helperText={isValidOriginalDevPortalUrl ? (
                                <FormattedMessage
                                    id='Apis.Details.Configuration.components.AdvertiseInfo.originalDevPortalUrl.help'
                                    defaultMessage='This is the original developer portal of the advertised API'
                                />
                            ) : (
                                <FormattedMessage
                                    id={'Apis.Details.Configuration.components.AdvertiseInfo'
                                    + '.originalDevPortalUrl.error'}
                                    defaultMessage='Invalid Original Developer Portal URL'
                                />
                            )}
                            style={{ marginTop: 0 }}
                        />
                    </>
                )}
            </Grid>
        </StyledGrid>
    );
};

AdvertiseInfo.propTypes = {
    configDispatcher: PropTypes.func.isRequired,
};

export default React.memo(AdvertiseInfo);

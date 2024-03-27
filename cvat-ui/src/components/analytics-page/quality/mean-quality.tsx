// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import '../styles.scss';

import React from 'react';
import Text from 'antd/lib/typography/Text';
import moment from 'moment';
import { QualityReport, Task, getCore } from 'cvat-core-wrapper';
import { useSelector, useDispatch } from 'react-redux';
import { CombinedState } from 'reducers';
import Button from 'antd/lib/button';
import { DownloadOutlined, MoreOutlined } from '@ant-design/icons';
import { analyticsActions } from 'actions/analytics-actions';
import AnalyticsCard from '../views/analytics-card';
import { toRepresentation } from './common';

interface Props {
    task: Task;
}

function MeanQuality(props: Props): JSX.Element {
    const { task } = props;
    const dispatch = useDispatch();
    const tasksReports: QualityReport[] = useSelector((state: CombinedState) => state.analytics.quality.tasksReports);
    const taskReport = tasksReports.find((report: QualityReport) => report.taskId === task.id);
    const reportSummary = taskReport?.summary;

    const tooltip = (
        <div className='cvat-analytics-tooltip-inner'>
            <Text>
                平均标注质量包括：
            </Text>
            <Text>
                正确的注释:&nbsp;
                {reportSummary?.validCount || 0}
            </Text>
            <Text>
                任务注释:&nbsp;
                {reportSummary?.dsCount || 0}
            </Text>
            <Text>
                GT注释:&nbsp;
                {reportSummary?.gtCount || 0}
            </Text>
            <Text>
                准确性:&nbsp;
                {toRepresentation(reportSummary?.accuracy)}
            </Text>
            <Text>
                精确:&nbsp;
                {toRepresentation(reportSummary?.precision)}
            </Text>
            <Text>
                记起:&nbsp;
                {toRepresentation(reportSummary?.recall)}
            </Text>
        </div>
    );

    const dowloadReportButton = (
        <div>
            {
                taskReport?.id ? (
                    <>
                        <Button type='primary' icon={<DownloadOutlined />} className='cvat-analytics-download-report-button'>
                            <a
                                href={`${getCore().config.backendAPI}/quality/reports/${taskReport?.id}/data`}
                                download={`quality-report-task_${task.id}-${taskReport?.id}.json`}
                            >
                                质量报告
                            </a>
                        </Button>
                        <MoreOutlined
                            className='cvat-quality-settings-switch'
                            onClick={() => dispatch(analyticsActions.switchQualitySettingsVisible(true))}
                        />
                        <div className='cvat-analytics-time-hint'>
                            <Text type='secondary'>{taskReport?.createdDate ? moment(taskReport?.createdDate).fromNow() : ''}</Text>
                        </div>
                    </>
                ) : null
            }
        </div>

    );
    return (
        <AnalyticsCard
            title='平均标注质量'
            className='cvat-task-mean-annotation-quality'
            value={toRepresentation(reportSummary?.accuracy)}
            tooltip={tooltip}
            rightElement={dowloadReportButton}
        />
    );
}

export default React.memo(MeanQuality);

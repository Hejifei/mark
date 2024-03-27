// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import '../styles.scss';

import React from 'react';
import Text from 'antd/lib/typography/Text';
import { QualityReport, QualitySummary, Task } from 'cvat-core-wrapper';
import { useSelector } from 'react-redux';
import { CombinedState } from 'reducers';
import { Col, Row } from 'antd/lib/grid';
import AnalyticsCard from '../views/analytics-card';
import { percent, clampValue } from './common';

interface Props {
    task: Task;
}

interface ConflictTooltipProps {
    reportSummary?: QualitySummary;
}

export function ConflictsTooltip(props: ConflictTooltipProps): JSX.Element {
    const { reportSummary } = props;
    return (
        <Row className='cvat-analytics-tooltip-conflicts-inner'>
            <Col span={12}>
                <Text>
                    告警:
                </Text>
                <Text>
                    低重叠:&nbsp;
                    {reportSummary?.conflictsByType.lowOverlap || 0}
                </Text>
                <Text>
                    方向不匹配:&nbsp;
                    {reportSummary?.conflictsByType.mismatchingDirection || 0}
                </Text>
                <Text>
                    属性不匹配:&nbsp;
                    {reportSummary?.conflictsByType.mismatchingAttributes || 0}
                </Text>
                <Text>
                    不匹配的组:&nbsp;
                    {reportSummary?.conflictsByType.mismatchingGroups || 0}
                </Text>
                <Text>
                    覆盖注释:&nbsp;
                    {reportSummary?.conflictsByType.coveredAnnotation || 0}
                </Text>
            </Col>
            <Col span={12}>
                <Text>
                    错误:
                </Text>
                <Text>
                    缺少注释:&nbsp;
                    {reportSummary?.conflictsByType.missingAnnotations || 0}
                </Text>
                <Text>
                    额外注释s:&nbsp;
                    {reportSummary?.conflictsByType.extraAnnotations || 0}
                </Text>
                <Text>
                    标签不匹配:&nbsp;
                    {reportSummary?.conflictsByType.mismatchingLabel || 0}
                </Text>
            </Col>
        </Row>
    );
}

function GTConflicts(props: Props): JSX.Element {
    const { task } = props;
    const tasksReports: QualityReport[] = useSelector((state: CombinedState) => state.analytics.quality.tasksReports);
    const taskReport = tasksReports.find((report: QualityReport) => report.taskId === task.id);

    let conflictsRepresentation: string | number = 'N/A';
    let reportSummary;
    if (taskReport) {
        reportSummary = taskReport.summary;
        conflictsRepresentation = clampValue(reportSummary?.conflictCount);
    }

    const bottomElement = (
        <>
            <Text type='secondary'>
                错误:
                {' '}
                {clampValue(reportSummary?.errorCount)}
                {reportSummary?.errorCount ?
                    ` (${percent(reportSummary?.errorCount, reportSummary?.conflictCount)})` : ''}
            </Text>
            <Text type='secondary'>
                {', '}
                告警:
                {' '}
                {clampValue(reportSummary?.warningCount)}
                { reportSummary?.warningCount ?
                    ` (${percent(reportSummary?.warningCount, reportSummary?.conflictCount)})` : '' }
            </Text>
        </>
    );

    return (
        <AnalyticsCard
            title='GT 冲突'
            className='cvat-task-gt-conflicts'
            value={conflictsRepresentation}
            tooltip={<ConflictsTooltip reportSummary={reportSummary} />}
            size={12}
            bottomElement={bottomElement}
        />
    );
}

export default React.memo(GTConflicts);

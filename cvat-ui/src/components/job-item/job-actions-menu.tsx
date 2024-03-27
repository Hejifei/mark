// Copyright (C) 2023-2024 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import Menu from 'antd/lib/menu';
import Modal from 'antd/lib/modal';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';
import { exportActions } from 'actions/export-actions';

import {
    Job, JobStage, JobType, getCore,
} from 'cvat-core-wrapper';
import { deleteJobAsync } from 'actions/jobs-actions';
import { importActions } from 'actions/import-actions';

const core = getCore();

interface Props {
    job: Job;
    onJobUpdate: (job: Job) => void;
}

function JobActionsMenu(props: Props): JSX.Element {
    const { job, onJobUpdate } = props;
    const history = useHistory();
    const dispatch = useDispatch();

    const onDelete = useCallback(() => {
        Modal.confirm({
            title: `工作 ${job.id} 将要被删除`,
            content: '所有相关数据（注释）都将丢失。 继续？',
            className: 'cvat-modal-confirm-delete-job',
            onOk: () => {
                dispatch(deleteJobAsync(job));
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: 'Delete',
        });
    }, [job]);

    return (
        <Menu
            className='cvat-job-item-menu'
            onClick={(action: MenuInfo) => {
                if (action.key === 'task') {
                    history.push(`/tasks/${job.taskId}`);
                } else if (action.key === 'project') {
                    history.push(`/projects/${job.projectId}`);
                } else if (action.key === 'bug_tracker') {
                    if (job.bugTracker) window.open(job.bugTracker, '_blank', 'noopener noreferrer');
                } else if (action.key === 'import_job') {
                    dispatch(importActions.openImportDatasetModal(job));
                } else if (action.key === 'export_job') {
                    dispatch(exportActions.openExportDatasetModal(job));
                } else if (action.key === 'view_analytics') {
                    history.push(`/tasks/${job.taskId}/jobs/${job.id}/analytics`);
                } else if (action.key === 'renew_job') {
                    job.state = core.enums.JobState.NEW;
                    job.stage = JobStage.ANNOTATION;
                    onJobUpdate(job);
                } else if (action.key === 'finish_job') {
                    job.stage = JobStage.ACCEPTANCE;
                    job.state = core.enums.JobState.COMPLETED;
                    onJobUpdate(job);
                }
            }}
        >
            <Menu.Item key='task' disabled={job.taskId === null}>前往任务</Menu.Item>
            <Menu.Item key='project' disabled={job.projectId === null}>前往项目</Menu.Item>
            <Menu.Item key='bug_tracker' disabled={!job.bugTracker}>转到错误跟踪器</Menu.Item>
            <Menu.Item key='import_job'>导入注释</Menu.Item>
            <Menu.Item key='export_job'>导出注释</Menu.Item>
            <Menu.Item key='view_analytics'>查看分析</Menu.Item>
            {[JobStage.ANNOTATION, JobStage.VALIDATION].includes(job.stage) ?
                <Menu.Item key='finish_job'>完成工作</Menu.Item> : null}
            {job.stage === JobStage.ACCEPTANCE ?
                <Menu.Item key='renew_job'>新建工作</Menu.Item> : null}
            <Menu.Divider />
            <Menu.Item
                key='delete'
                disabled={job.type !== JobType.GROUND_TRUTH}
                onClick={() => onDelete()}
            >
                删除
            </Menu.Item>
        </Menu>
    );
}

export default React.memo(JobActionsMenu);

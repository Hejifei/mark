// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useCallback } from 'react';
import Menu from 'antd/lib/menu';
import Modal from 'antd/lib/modal';
import { LoadingOutlined } from '@ant-design/icons';
// eslint-disable-next-line import/no-extraneous-dependencies
import { MenuInfo } from 'rc-menu/lib/interface';
import { DimensionType } from 'cvat-core-wrapper';
import { usePlugins } from 'utils/hooks';
import { CombinedState } from 'reducers';

interface Props {
    taskID: number;
    projectID: number | null;
    taskMode: string;
    bugTracker: string;
    loaders: any[];
    dumpers: any[];
    inferenceIsActive: boolean;
    taskDimension: DimensionType;
    backupIsActive: boolean;
    onClickMenu: (params: MenuInfo) => void;
}

export enum Actions {
    LOAD_TASK_ANNO = 'load_task_anno',
    EXPORT_TASK_DATASET = 'export_task_dataset',
    DELETE_TASK = 'delete_task',
    RUN_AUTO_ANNOTATION = 'run_auto_annotation',
    MOVE_TASK_TO_PROJECT = 'move_task_to_project',
    OPEN_BUG_TRACKER = 'open_bug_tracker',
    BACKUP_TASK = 'backup_task',
    VIEW_ANALYTICS = 'view_analytics',
}

function ActionsMenuComponent(props: Props): JSX.Element {
    const {
        taskID,
        projectID,
        bugTracker,
        inferenceIsActive,
        backupIsActive,
        onClickMenu,
    } = props;

    const plugins = usePlugins((state: CombinedState) => state.plugins.components.taskActions.items, props);

    const onClickMenuWrapper = useCallback(
        (params: MenuInfo) => {
            if (!params) {
                return;
            }

            if (params.key === Actions.DELETE_TASK) {
                Modal.confirm({
                    title: `任务 ${taskID} 将要被删除`,
                    content: '所有相关数据（图像、注释）都将丢失。 继续？',
                    className: 'cvat-modal-confirm-delete-task',
                    onOk: () => {
                        onClickMenu(params);
                    },
                    okButtonProps: {
                        type: 'primary',
                        danger: true,
                    },
                    okText: '删除',
                    cancelText: '取消'
                });
            } else {
                onClickMenu(params);
            }
        },
        [taskID],
    );

    const menuItems: [JSX.Element, number][] = [];
    menuItems.push([(
        <Menu.Item key={Actions.LOAD_TASK_ANNO}>上传注释</Menu.Item>
    ), 0]);

    menuItems.push([(
        <Menu.Item key={Actions.EXPORT_TASK_DATASET}>导出任务数据集</Menu.Item>
    ), 10]);

    if (bugTracker) {
        menuItems.push([(
            <Menu.Item key={Actions.OPEN_BUG_TRACKER}>打开错误跟踪器</Menu.Item>
        ), 20]);
    }

    menuItems.push([(
        <Menu.Item disabled={inferenceIsActive} key={Actions.RUN_AUTO_ANNOTATION}>
            自动标注
        </Menu.Item>
    ), 30]);

    menuItems.push([(
        <Menu.Item
            key={Actions.BACKUP_TASK}
            disabled={backupIsActive}
            icon={backupIsActive && <LoadingOutlined id='cvat-backup-task-loading' />}
        >
            备份任务
        </Menu.Item>
    ), 40]);

    menuItems.push([(
        <Menu.Item
            key={Actions.VIEW_ANALYTICS}
        >
            查看分析
        </Menu.Item>
    ), 50]);

    if (projectID === null) {
        menuItems.push([(
            <Menu.Item key={Actions.MOVE_TASK_TO_PROJECT}>移至项目</Menu.Item>
        ), 60]);
    }

    menuItems.push([(
        <React.Fragment key={Actions.DELETE_TASK}>
            <Menu.Divider />
            <Menu.Item key={Actions.DELETE_TASK}>删除</Menu.Item>
        </React.Fragment>
    ), 70]);

    menuItems.push(
        ...plugins.map(({ component: Component, weight }, index) => {
            const menuItem = Component({ key: index, targetProps: props });
            return [menuItem, weight] as [JSX.Element, number];
        }),
    );

    return (
        <Menu selectable={false} className='cvat-actions-menu' onClick={onClickMenuWrapper}>
            { menuItems.sort((menuItem1, menuItem2) => menuItem1[1] - menuItem2[1])
                .map((menuItem) => menuItem[0]) }
        </Menu>
    );
}

export default React.memo(ActionsMenuComponent);

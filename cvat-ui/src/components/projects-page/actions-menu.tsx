// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'antd/lib/modal';
import Menu from 'antd/lib/menu';
import { LoadingOutlined } from '@ant-design/icons';
import { CombinedState } from 'reducers';
import { deleteProjectAsync } from 'actions/projects-actions';
import { exportActions } from 'actions/export-actions';
import { importActions } from 'actions/import-actions';
import { useHistory } from 'react-router';
import { usePlugins } from 'utils/hooks';

interface Props {
    projectInstance: any;
}

function ProjectActionsMenuComponent(props: Props): JSX.Element {
    const { projectInstance } = props;

    const history = useHistory();
    const dispatch = useDispatch();
    const plugins = usePlugins((state: CombinedState) => state.plugins.components.projectActions.items, props);
    const exportBackupIsActive = useSelector((state: CombinedState) => (
        state.export.projects.backup.current[projectInstance.id]
    ));

    const onDeleteProject = useCallback((): void => {
        Modal.confirm({
            title: `项目: ${projectInstance.id} 即将被删除`,
            content: '所有相关数据（图像、注释）都将丢失。 继续?',
            className: 'cvat-modal-confirm-remove-project',
            onOk: () => {
                dispatch(deleteProjectAsync(projectInstance));
            },
            okButtonProps: {
                type: 'primary',
                danger: true,
            },
            okText: '删除',
            cancelText: '取消',
        });
    }, []);

    const menuItems: [JSX.Element, number][] = [];
    menuItems.push([(
        <Menu.Item key='export-dataset' onClick={() => dispatch(exportActions.openExportDatasetModal(projectInstance))}>
            导出数据集
        </Menu.Item>
    ), 0]);

    menuItems.push([(
        <Menu.Item key='import-dataset' onClick={() => dispatch(importActions.openImportDatasetModal(projectInstance))}>
            导入数据集
        </Menu.Item>
    ), 10]);

    menuItems.push([(
        <Menu.Item
            key='backup-project'
            disabled={exportBackupIsActive}
            onClick={() => dispatch(exportActions.openExportBackupModal(projectInstance))}
            icon={exportBackupIsActive && <LoadingOutlined id='cvat-export-project-loading' />}
        >
            备份项目
        </Menu.Item>
    ), 20]);

    menuItems.push([(
        <Menu.Item key='view-analytics'>
            <a
                href={`/projects/${projectInstance.id}/analytics`}
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    history.push({
                        pathname: `/projects/${projectInstance.id}/analytics`,
                    });
                    return false;
                }}
            >
                查看分析
            </a>
        </Menu.Item>
    ), 30]);

    menuItems.push([(
        <Menu.Item key='set-webhooks'>
            <a
                href={`/projects/${projectInstance.id}/webhooks`}
                onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    history.push({
                        pathname: `/projects/${projectInstance.id}/webhooks`,
                    });
                    return false;
                }}
            >
                设置错误
            </a>
        </Menu.Item>
    ), 40]);

    menuItems.push([(
        <React.Fragment key='delete'>
            <Menu.Divider />
            <Menu.Item key='delete' onClick={onDeleteProject}>
                删除
            </Menu.Item>
        </React.Fragment>
    ), 50]);

    menuItems.push(
        ...plugins.map(({ component: Component, weight }, index) => {
            const menuItem = Component({ key: index, targetProps: props });
            return [menuItem, weight] as [JSX.Element, number];
        }),
    );

    return (
        <Menu selectable={false} className='cvat-project-actions-menu'>
            { menuItems.sort((menuItem1, menuItem2) => menuItem1[1] - menuItem2[1])
                .map((menuItem) => menuItem[0]) }
        </Menu>
    );
}

export default React.memo(ProjectActionsMenuComponent);

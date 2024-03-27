// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';
import Button from 'antd/lib/button';

import ConstructorViewerItem from './constructor-viewer-item';
import { LabelOptColor } from './common';

interface ConstructorViewerProps {
    labels: LabelOptColor[];
    onUpdate: (label: LabelOptColor) => void;
    onDelete: (label: LabelOptColor) => void;
    onCreate: (creatorType: 'basic' | 'skeleton' | 'model') => void;
}

function ConstructorViewer(props: ConstructorViewerProps): JSX.Element {
    const {
        onCreate, onUpdate, onDelete, labels,
    } = props;
    const list = [
        <Button key='create' type='ghost' onClick={() => onCreate('basic')} className='cvat-constructor-viewer-new-item'>
            添加标签
            <PlusCircleOutlined />
        </Button>,
        <Button key='create_skeleton' type='ghost' onClick={() => onCreate('skeleton')} className='cvat-constructor-viewer-new-skeleton-item'>
            设置骨架
            <PlusCircleOutlined />
        </Button>,
        <Button key='from_model' type='ghost' onClick={() => onCreate('model')} className='cvat-constructor-viewer-new-from-model-item'>
            来自型号
            <PlusCircleOutlined />
        </Button>,
    ];
    for (const label of labels) {
        list.push(
            <ConstructorViewerItem
                onUpdate={onUpdate}
                onDelete={onDelete}
                label={label}
                key={label.id}
                color={label.color}
            />,
        );
    }

    return <div className='cvat-constructor-viewer'>{list}</div>;
}

export default React.memo(ConstructorViewer);

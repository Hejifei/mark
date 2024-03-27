// Copyright (C) 2021-2022 Intel Corporation
// Copyright (C) 2022-2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import Modal from 'antd/lib/modal';
import Notification from 'antd/lib/notification';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import Text from 'antd/lib/typography/Text';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Form from 'antd/lib/form';
import Switch from 'antd/lib/switch';
import Space from 'antd/lib/space';
import TargetStorageField from 'components/storage/target-storage-field';
import { CombinedState, StorageLocation } from 'reducers';
import { exportActions, exportDatasetAsync } from 'actions/export-actions';
import {
    Dumper, Job, Project, Storage, StorageData, Task,
} from 'cvat-core-wrapper';

type FormValues = {
    selectedFormat: string | undefined;
    saveImages: boolean;
    customName: string | undefined;
    targetStorage: StorageData;
    useProjectTargetStorage: boolean;
};

const initialValues: FormValues = {
    selectedFormat: undefined,
    saveImages: false,
    customName: undefined,
    targetStorage: {
        location: StorageLocation.LOCAL,
        cloudStorageId: undefined,
    },
    useProjectTargetStorage: true,
};

function ExportDatasetModal(props: StateToProps): JSX.Element {
    const {
        dumpers,
        instance,
        current,
    } = props;

    const [instanceType, setInstanceType] = useState('');

    const [useDefaultTargetStorage, setUseDefaultTargetStorage] = useState(true);
    const [form] = Form.useForm();
    const [targetStorage, setTargetStorage] = useState<StorageData>({
        location: StorageLocation.LOCAL,
    });
    const [defaultStorageLocation, setDefaultStorageLocation] = useState(StorageLocation.LOCAL);
    const [defaultStorageCloudId, setDefaultStorageCloudId] = useState<number>();
    const [helpMessage, setHelpMessage] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        if (instance instanceof Project) {
            setInstanceType(`项目 #${instance.id}`);
        } else if (instance instanceof Task || instance instanceof Job) {
            if (instance instanceof Task) {
                setInstanceType(`任务 #${instance.id}`);
            } else {
                setInstanceType(`工作 #${instance.id}`);
            }
            if (instance.mode === 'interpolation' && instance.dimension === '2d') {
                form.setFieldsValue({ selectedFormat: 'CVAT for video 1.1' });
            } else if (instance.mode === 'annotation' && instance.dimension === '2d') {
                form.setFieldsValue({ selectedFormat: 'CVAT for images 1.1' });
            }
        }
    }, [instance]);

    useEffect(() => {
        if (instance) {
            setDefaultStorageLocation(instance.targetStorage.location);
            setDefaultStorageCloudId(instance.targetStorage.cloudStorageId);
        }
    }, [instance]);

    useEffect(() => {
        console.log({defaultStorageLocation})
        setHelpMessage(`导出到 ${(defaultStorageLocation) ? defaultStorageLocation.split('_')[0].replace('local', '本地') : '本地'} ` +
                        `存储 ${(defaultStorageCloudId) ? `№${defaultStorageCloudId}` : ''}`);
    }, [defaultStorageLocation, defaultStorageCloudId]);

    const closeModal = (): void => {
        setUseDefaultTargetStorage(true);
        setTargetStorage({ location: StorageLocation.LOCAL });
        form.resetFields();
        dispatch(exportActions.closeExportDatasetModal(instance));
    };

    const handleExport = useCallback(
        (values: FormValues): void => {
            // have to validate format before so it would not be undefined
            dispatch(
                exportDatasetAsync(
                    instance,
                    values.selectedFormat as string,
                    values.saveImages,
                    useDefaultTargetStorage,
                    useDefaultTargetStorage ? new Storage({
                        location: defaultStorageLocation,
                        cloudStorageId: defaultStorageCloudId,
                    }) : new Storage(targetStorage),
                    values.customName ? `${values.customName}.zip` : undefined,
                ),
            );
            closeModal();
            const resource = values.saveImages ? '数据集' : '注释';
            Notification.info({
                message: `${resource} 导出开始`,
                description:
                    `${resource} ${instanceType} 的导出已开始 . ` +
                    `一旦 ${resource} 准备好将自动开始下载.`,
                className: `cvat-notification-notice-export-${instanceType.split(' ')[0]}-start`,
            });
        },
        [instance, instanceType, useDefaultTargetStorage, defaultStorageLocation, defaultStorageCloudId, targetStorage],
    );

    return (
        <Modal
            title={<Text strong>{`导出 ${instanceType} 作为数据集`}</Text>}
            visible={!!instance}
            onCancel={closeModal}
            onOk={() => form.submit()}
            className={`cvat-modal-export-${instanceType.split(' ')[0]}`}
            destroyOnClose
            okText='确定'
            cancelText='取消'
        >
            <Form
                name='Export dataset'
                form={form}
                layout='vertical'
                initialValues={initialValues}
                onFinish={handleExport}
            >
                <Form.Item
                    name='selectedFormat'
                    label={<Text strong>导出格式</Text>}
                    rules={[{ required: true, message: '格式必选' }]}
                >
                    <Select virtual={false} placeholder='请选择导出格式' className='cvat-modal-export-select'>
                        {dumpers
                            .sort((a: Dumper, b: Dumper) => a.name.localeCompare(b.name))
                            .filter(
                                (dumper: Dumper): boolean => dumper.dimension === instance?.dimension ||
                                    (instance instanceof Project && instance.dimension === null),
                            )
                            .map(
                                (dumper: Dumper): JSX.Element => {
                                    const pending = (instance && current ? current : [])
                                        .includes(dumper.name);
                                    const disabled = !dumper.enabled || pending;
                                    return (
                                        <Select.Option
                                            value={dumper.name}
                                            key={dumper.name}
                                            disabled={disabled}
                                            className='cvat-modal-export-option-item'
                                        >
                                            <DownloadOutlined />
                                            <Text disabled={disabled}>{dumper.name}</Text>
                                            {pending && <LoadingOutlined style={{ marginLeft: 10 }} />}
                                        </Select.Option>
                                    );
                                },
                            )}
                    </Select>
                </Form.Item>
                <Space>
                    <Form.Item
                        className='cvat-modal-export-switch-use-default-storage'
                        name='saveImages'
                        valuePropName='checked'
                    >
                        <Switch className='cvat-modal-export-save-images' />
                    </Form.Item>
                    <Text strong>保存图片</Text>
                </Space>

                <Form.Item label={<Text strong>自定义名称</Text>} name='customName'>
                    <Input
                        placeholder='数据集的自定义名称'
                        suffix='.zip'
                        className='cvat-modal-export-filename-input'
                    />
                </Form.Item>
                <TargetStorageField
                    instanceId={instance ? instance.id : null}
                    switchDescription='使用默认设置'
                    switchHelpMessage={helpMessage}
                    useDefaultStorage={useDefaultTargetStorage}
                    storageDescription='Specify target storage for export dataset'
                    locationValue={targetStorage.location}
                    onChangeUseDefaultStorage={(value: boolean) => setUseDefaultTargetStorage(value)}
                    onChangeStorage={(value: StorageData) => setTargetStorage(value)}
                    onChangeLocationValue={(value: StorageLocation) => {
                        setTargetStorage({ location: value });
                    }}
                />
            </Form>
        </Modal>
    );
}

interface StateToProps {
    dumpers: Dumper[];
    instance: Project | Task | Job | null;
    current: string[];
}

function mapStateToProps(state: CombinedState): StateToProps {
    const { instanceType } = state.export;
    const instance = !instanceType ? null : (
        state.export[`${instanceType}s` as 'projects' | 'tasks' | 'jobs']
    ).dataset.modalInstance;

    return {
        instance,
        current: !instanceType ? [] : (
            state.export[`${instanceType}s` as 'projects' | 'tasks' | 'jobs']
        ).dataset.current[instance.id],
        dumpers: state.formats.annotationFormats.dumpers,
    };
}

export default connect(mapStateToProps)(ExportDatasetModal);

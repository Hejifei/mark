// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import './styles.scss';

import React, { useCallback } from 'react';
import { Row, Col } from 'antd/lib/grid';
import Form from 'antd/lib/form';
import Button from 'antd/lib/button';
import Select from 'antd/lib/select';
import InputNumber from 'antd/lib/input-number';
import CVATTooltip from 'components/common/cvat-tooltip';

import { CombinedState } from 'reducers';
import { useDispatch, useSelector } from 'react-redux';
import { JobType } from 'cvat-core/src/enums';
import { Task } from 'cvat-core-wrapper';
import { createJobAsync } from 'actions/jobs-actions';
import { useHistory } from 'react-router';
import Space from 'antd/lib/space';
import { QuestionCircleOutlined } from '@ant-design/icons';

export enum FrameSelectionMethod {
    RANDOM = 'random_uniform',
}

interface JobDataMutual {
    task_id: number,
    frame_selection_method: FrameSelectionMethod,
    type: JobType,
    seed?: number,
}

export interface JobData extends JobDataMutual {
    frame_count: number,
}

export interface JobFormData extends JobDataMutual {
    quantity: number,
    frame_count: number,
}

interface Props {
    task: Task
}

const defaultQuantity = 5;

function JobForm(props: Props): JSX.Element {
    const { task } = props;
    const { size: taskSize } = task;
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const history = useHistory();

    const fetching = useSelector((state: CombinedState) => state.models.fetching);

    const submit = useCallback(async (): Promise<any> => {
        try {
            const values: JobFormData = await form.validateFields();
            const data: JobData = {
                frame_selection_method: values.frame_selection_method,
                type: values.type,
                seed: values.seed,
                frame_count: values.frame_count,
                task_id: task.id,
            };
            const createdJob = await dispatch(createJobAsync(data));

            return createdJob;
        } catch (e) {
            return false;
        }
    }, [task]);

    const onSubmit = async (): Promise<void> => {
        const createdJob = await submit();
        if (createdJob) {
            history.push(`/tasks/${task.id}/jobs/${createdJob.id}`);
        }
    };

    const onQuantityChange = useCallback((value: number | null) => {
        if (value) {
            const newFrameCount = Math.round((value * taskSize) / 100);
            form.setFieldsValue({
                frame_count: newFrameCount,
            });
        }
    }, [taskSize]);

    const onFrameCountChange = useCallback((value: number | null) => {
        if (value) {
            const newQuantity = Math.floor((value / taskSize) * 100);
            form.setFieldsValue({
                quantity: newQuantity,
            });
        }
    }, [taskSize]);
    const frameCountDescription = 'A representative set, 5-15% of randomly chosen frames is recommended';

    return (
        <Row className='cvat-create-job-form-wrapper'>
            <Col span={24}>
                <Form
                    form={form}
                    layout='vertical'
                    initialValues={{
                        type: JobType.GROUND_TRUTH,
                        frame_selection_method: FrameSelectionMethod.RANDOM,
                        quantity: defaultQuantity,
                        frame_count: Math.floor((defaultQuantity * taskSize) / 100),
                    }}
                >
                    <Col>
                        <Form.Item
                            name='type'
                            label='工作类型'
                            rules={[{ required: true, message: '请指定职位类型' }]}
                        >
                            <Select
                                virtual={false}
                                className='cvat-select-job-type'
                            >
                                <Select.Option value={JobType.GROUND_TRUTH}>
                                地面真相
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name='frame_selection_method'
                            label='框架选择方法'
                            rules={[{ required: true, message: '请指定框架选择方法' }]}
                        >
                            <Select
                                virtual={false}
                                className='cvat-select-frame-selection-method'
                            >
                                <Select.Option value={FrameSelectionMethod.RANDOM}>
                                随机的
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col>
                        <Row justify='space-between'>
                            <Col>
                                <Form.Item
                                    name='quantity'
                                    label={(
                                        <Space>
                                            数量 %
                                            <CVATTooltip title={frameCountDescription}>
                                                <QuestionCircleOutlined
                                                    style={{ opacity: 0.5 }}
                                                />
                                            </CVATTooltip>
                                        </Space>
                                    )}
                                    rules={[{ required: true, message: '请注明数量' }]}
                                >
                                    <InputNumber
                                        className='cvat-input-frame-quantity'
                                        min={1}
                                        max={100}
                                        size='middle'
                                        onChange={onQuantityChange}
                                    />
                                </Form.Item>

                            </Col>
                            <Col>
                                <Row>
                                    <Col>
                                        <Form.Item
                                            name='frame_count'
                                            label={(
                                                <Space>
                                                    帧数
                                                    <CVATTooltip title={frameCountDescription}>
                                                        <QuestionCircleOutlined
                                                            style={{ opacity: 0.5 }}
                                                        />
                                                    </CVATTooltip>
                                                </Space>
                                            )}
                                            rules={[{ required: true, message: '请指定帧数' }]}
                                        >
                                            <InputNumber
                                                className='cvat-input-frame-count'
                                                min={1}
                                                max={taskSize}
                                                size='middle'
                                                onChange={onFrameCountChange}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col>
                                <Form.Item
                                    name='seed'
                                    label='种子'
                                >
                                    <InputNumber
                                        className='cvat-input-seed'
                                        size='middle'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Form>
            </Col>
            <Col span={24} className='cvat-create-job-actions'>
                <Row justify='end'>
                    <Col>
                        <Button
                            className='cvat-submit-job-button'
                            type='primary'
                            onClick={onSubmit}
                            loading={fetching}
                        >
                            提交
                        </Button>
                    </Col>
                </Row>
            </Col>
        </Row>
    );
}

export default React.memo(JobForm);

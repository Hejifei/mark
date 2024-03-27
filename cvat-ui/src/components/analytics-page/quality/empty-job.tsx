// Copyright (C) 2023 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import '../styles.scss';

import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'antd/lib/grid';
import Card from 'antd/lib/card';
import Button from 'antd/lib/button';
import Title from 'antd/lib/typography/Title';

interface Props {
    taskId: number,
}

function EmptyJobComponent(props: Props): JSX.Element {
    const { taskId } = props;

    return (
        <Col span={24}>
            <Card className='cvat-job-empty-ground-truth-item'>
                <Row justify='space-between' align='middle'>
                    <Col>
                        <Title level={5}>尚未创建 Ground Truth 职位...</Title>
                    </Col>
                    <Col>
                        <Button type='primary'>
                            <Link to={`/tasks/${taskId}/jobs/create`}>新增</Link>
                        </Button>
                    </Col>
                </Row>
            </Card>
        </Col>
    );
}

export default React.memo(EmptyJobComponent);

// Copyright (C) 2020-2022 Intel Corporation
// Copyright (C) 2022 CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Col } from 'antd/lib/grid';
import Select from 'antd/lib/select';
import Text from 'antd/lib/typography/Text';

import { StatesOrdering } from 'reducers';

interface StatesOrderingSelectorComponentProps {
    statesOrdering: StatesOrdering;
    changeStatesOrdering(value: StatesOrdering): void;
}

function StatesOrderingSelectorComponent(props: StatesOrderingSelectorComponentProps): JSX.Element {
    const { statesOrdering, changeStatesOrdering } = props;

    return (
        <Col>
            <Text strong>排序方式</Text>
            <Select
                className='cvat-objects-sidebar-ordering-selector'
                dropdownClassName='cvat-objects-sidebar-ordering-dropdown'
                value={statesOrdering}
                onChange={changeStatesOrdering}
            >
                <Select.Option key={StatesOrdering.ID_DESCENT} value={StatesOrdering.ID_DESCENT}>
                    ID 降序
                </Select.Option>
                <Select.Option key={StatesOrdering.ID_ASCENT} value={StatesOrdering.ID_ASCENT}>
                    ID 升序
                </Select.Option>
                <Select.Option key={StatesOrdering.UPDATED} value={StatesOrdering.UPDATED}>
                    更新时间
                </Select.Option>
                <Select.Option key={StatesOrdering.Z_ORDER} value={StatesOrdering.Z_ORDER}>
                    Z 排序
                </Select.Option>
            </Select>
        </Col>
    );
}

export default React.memo(StatesOrderingSelectorComponent);

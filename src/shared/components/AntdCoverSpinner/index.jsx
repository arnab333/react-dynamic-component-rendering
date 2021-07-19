import { memo, Fragment } from 'react';
import { Spin } from 'antd';

const AntdCoverSpinner = ({ active, children, size }) => {
  return (
    <Fragment>
      {active ? <Spin size={size || 'large'}>{children}</Spin> : children}
    </Fragment>
  );
};

export default memo(AntdCoverSpinner);

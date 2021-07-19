import { Fragment } from 'react';
import { Card, CardProps } from 'antd';

import cssStyles from './styles/card.module.css';

const AntdCard = ({ children, className, elevate, ...rest }: CardProps) => {
  return (
    <Fragment>
      <Card
        {...rest}
        className={`${className ?? ''} ${elevate ? cssStyles.card : ''}`}>
        {children}
      </Card>
    </Fragment>
  );
};

export default AntdCard;

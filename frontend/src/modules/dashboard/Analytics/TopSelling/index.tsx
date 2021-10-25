import React from 'react';
import AppCard from '../../../../@crema/core/AppCard';
import ProductCell from './ProductCell';
import {useIntl} from 'react-intl';
import {TopSellingProduct} from '../../../../types/models/Analytics';

interface TopSellingProps {
  products: TopSellingProduct[];
}

const TopSelling: React.FC<TopSellingProps> = ({products}) => {
  const {messages} = useIntl();
  return (
    <AppCard
      height={1}
      title={messages['dashboard.analytics.topSellingProducts']}
      footer={'+12 ' + messages['common.more']}>
      {products.map((data, index) => (
        <ProductCell key={index} data={data} />
      ))}
    </AppCard>
  );
};

export default TopSelling;

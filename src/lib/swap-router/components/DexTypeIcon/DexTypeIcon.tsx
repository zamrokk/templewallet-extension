import React, { FC } from 'react';

import { DexTypeEnum } from 'swap-router-sdk';

import { ReactComponent as LiquidityBackingIcon } from './icons/liquidity-backing-icon.svg';
import { ReactComponent as PlentyIcon } from './icons/plenty.svg';
import { ReactComponent as QuipuSwapIcon } from './icons/quipu-swap-icon.svg';
import { ReactComponent as YouvesIcon } from './icons/youves.svg';

interface Props {
  dexType: DexTypeEnum;
}

export const DexTypeIcon: FC<Props> = ({ dexType }) => {
  switch (dexType) {
    case DexTypeEnum.QuipuSwap:
    case DexTypeEnum.QuipuSwapTokenToTokenDex:
      return <QuipuSwapIcon />;
    case DexTypeEnum.Plenty:
      return <PlentyIcon />;
    case DexTypeEnum.LiquidityBaking:
      return <LiquidityBackingIcon />;
    case DexTypeEnum.Youves:
      return <YouvesIcon />;
  }
};

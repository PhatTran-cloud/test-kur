import React from 'react';
import { Composition } from 'remotion';
import { GreekMonsters3D } from './GreekMonsters3D';

export const GreekMonsters3DComp: React.FC = () => {
  return (
    <Composition
      id="GreekMonsters3D"
      component={GreekMonsters3D}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

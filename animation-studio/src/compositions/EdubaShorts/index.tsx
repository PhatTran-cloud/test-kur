import { StardustToHumanComp } from '../../../../output/stardust-to-human/build/StardustToHuman';
import React from 'react';
import { Folder } from 'remotion';

// ── Register compositions here ──────────────────────────────
// Output builds (commented out — builds not present on disk)
// import { ShieldAndSword } from '../../../../output/shield-and-sword/build/ShieldAndSword';
// import { SolarSystem } from '../../../../output/solar-system/build/SolarSystem';
// import { QuantumRealm } from '../../../../output/quantum-realm/build/QuantumRealm';
// import { DancingPlague } from '../../../../output/dancing-plague/build/DancingPlague';
// import { TheBloop } from '../../../../output/the-bloop/build/TheBloop';
// import { BlackHoles } from '../../../../output/black-holes/build/BlackHoles';
// import { GlobalEconomy2026 } from '../../../../output/global-economy-2026/build/GlobalEconomy2026';
// import { JonbenetRamsey } from '../../../../output/jonbenet-ramsey/build/JonbenetRamsey';
// import { BermudaTriangle } from '../../../../output/bermuda-triangle/build/BermudaTriangle';
// import { EconomicGrowth } from '../../../../output/economic-growth/build/EconomicGrowth';
// import { StealthFighter } from '../../../../output/stealth-fighter/build/StealthFighter';
// import { SunDisappears } from '../../../../output/sun-disappears/build/SunDisappears';
// import { SolarSystem3D } from '../../../../output/solar-system-3d/build/SolarSystem3D';
// import { BlackHole3D } from '../../../../output/blackhole-3d/build/BlackHole3D';
// import { GreekMonsters } from '../../../../output/greek-monsters/build/GreekMonsters';
// import { GreekMonstersV2Comp } from '../../../../output/greek-monsters-v2/build/GreekMonstersV2Comp';
// import { FermiParadox } from '../../../../output/fermi-paradox/build/FermiParadox';

// Active builds
// Unavailable generated build: import { FuelPriceCrisis } from '../../../../output/fuel-price-crisis/build/FuelPriceCrisis';
// Unavailable generated build: import { FuelPriceCrisisV2Comp } from '../../../../output/fuel-price-crisis/build-v2/FuelPriceCrisisV2';
// Unavailable generated build: import { UniverseMysteries } from '../../../../output/universe-mysteries/build/UniverseMysteries';
// Unavailable generated build: import { UniverseMysteriesV3 } from '../../../../output/universe-mysteries/build-v3/UniverseMysteriesV3';
// Unavailable generated build: import { AstronautLife } from '../../../../output/astronaut-life/build/AstronautLife';
// Unavailable generated build: import { AreWeAlone } from '../../../../output/are-we-alone/build/AreWeAlone';
// Unavailable generated build: import { GalaxySecrets } from '../../../../output/galaxy-secrets/build/GalaxySecrets';
// Unavailable generated build: import { DarkForest } from '../../../../output/dark-forest/build/DarkForest';
// Unavailable generated build: import { ElNino } from '../../../../output/el-nino/build/ElNino';
// Unavailable generated build: import { Volcanoes } from '../../../../output/volcanoes/build/Volcanoes';

// Local src/ compositions
import { GreekMonsters3DComp } from '../GreekMonsters3D/GreekMonsters3DComp';
import { ShaderMonsterComp } from '../GreekMonsters3D/ShaderMonster';
import { SDFMonsterComp } from '../GreekMonsters3D/SDFMonster';
import { GLTFMonsterComp } from '../GreekMonsters3D/GLTFMonster';
import { SolarSystem3DTestComp } from '../SolarSystem3DTest/SolarSystem3DTest';
import { BlackHole3DTestComp } from '../SolarSystem3DTest/BlackHole3DTest';
import { SolarSystemFlatComp } from '../SolarSystem3DTest/SolarSystemFlat';
import { SVGShowcaseComp } from '../SolarSystem3DTest/SVGShowcase';
import { CreatureShowcaseComp } from '../SolarSystem3DTest/CreatureShowcase';
import { CartoonCreaturesComp } from '../SolarSystem3DTest/CartoonCreatures';
import { DarkCartoonComp } from '../SolarSystem3DTest/DarkCartoon';
import { CartoonCharactersComp } from '../SolarSystem3DTest/CartoonCharacters';
import { DarkCharactersComp } from '../SolarSystem3DTest/DarkCharacters';
import { HorrorStickmanComp } from '../SolarSystem3DTest/HorrorStickman';
import { CreepyCartoonComp, CreepyStickComp } from '../SolarSystem3DTest/CreepyCartoon';
import { ForestHorrorComp, ForestHorrorStickComp } from '../SolarSystem3DTest/ForestHorror';
import { StickHeroesComp } from '../SolarSystem3DTest/StickHeroes';
import { DoodleStyleTestComp } from '../SolarSystem3DTest/DoodleStyleTest';
import { SolarSystem10sComp } from '../SolarSystem3DTest/SolarSystem10s';
import { SolarSystemSVG10sComp } from '../SolarSystem3DTest/SolarSystemSVG10s';

export const EdubaShorts: React.FC = () => {
  return (
    <Folder name="EdubaShorts">
      <StardustToHumanComp />
      {/* FuelPriceCrisis: generated build absent in this checkout */}
      {/* FuelPriceCrisisV2Comp: generated build absent in this checkout */}
      <GreekMonsters3DComp />
      <ShaderMonsterComp />
      <SDFMonsterComp />
      <GLTFMonsterComp />
      <SolarSystem3DTestComp />
      <BlackHole3DTestComp />
      <SolarSystemFlatComp />
      <SVGShowcaseComp />
      <CreatureShowcaseComp />
      <CartoonCreaturesComp />
      <DarkCartoonComp />
      <CartoonCharactersComp />
      <DarkCharactersComp />
      <HorrorStickmanComp />
      <CreepyCartoonComp />
      <CreepyStickComp />
      <ForestHorrorComp />
      <ForestHorrorStickComp />
      <StickHeroesComp />
      <DoodleStyleTestComp />
      <SolarSystem10sComp />
      <SolarSystemSVG10sComp />
      {/* UniverseMysteries: generated build absent in this checkout */}
      {/* UniverseMysteriesV3: generated build absent in this checkout */}
      {/* AstronautLife: generated build absent in this checkout */}
      {/* AreWeAlone: generated build absent in this checkout */}
      {/* GalaxySecrets: generated build absent in this checkout */}
      {/* DarkForest: generated build absent in this checkout */}
      {/* ElNino: generated build absent in this checkout */}
      {/* Volcanoes: generated build absent in this checkout */}
    </Folder>
  );
};

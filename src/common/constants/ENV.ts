import jetEnv, { num } from 'jet-env';
import { isEnumVal } from 'jet-validators';

import { NodeEnvs } from '.';


/******************************************************************************
                                 Setup
******************************************************************************/

const ENV = jetEnv({
  NodeEnv: isEnumVal(NodeEnvs),
  Port: num,
});

console.log('ENV', ENV);
/******************************************************************************
                            Export default
******************************************************************************/

export default ENV;

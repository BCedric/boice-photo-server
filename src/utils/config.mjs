import prodConfig from '../../env/prod-config.mjs'
import devConfig from '../../env/dev-config.mjs'

export default process.env.PORT != null ? prodConfig : devConfig
